import argparse
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Optional, Union

from roboflow import Roboflow
from ultralytics import YOLO

from app.core.config import settings


BACKEND_ROOT = Path(__file__).resolve().parents[2]
DATASET_ROOT = BACKEND_ROOT / "app" / "ai_model"
DEFAULT_DETECT_MODEL = BACKEND_ROOT / "yolov8n.pt"
DEFAULT_CLASSIFY_MODEL = Path("yolov8n-cls.pt")
DEFAULT_RUNS_DIR = BACKEND_ROOT / "runs"
DEFAULT_RUN_NAME = "ecosnap_8_classes"
CLASSIFICATION_EXPORT_FORMATS = {"folder", "multiclass", "clip"}

_status_lock = Lock()
_training_status: dict[str, Any] = {
    "status": "idle",
    "message": "Training has not started yet.",
    "device": None,
    "run_name": None,
    "data_yaml": None,
    "run_dir": None,
    "best_model_path": None,
    "started_at": None,
    "finished_at": None,
    "error": None,
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _set_training_status(**updates: Any) -> dict[str, Any]:
    with _status_lock:
        _training_status.update(updates)
        return dict(_training_status)


def get_training_status() -> dict[str, Any]:
    with _status_lock:
        return dict(_training_status)


def require_setting(value: str, env_name: str) -> str:
    if not value:
        raise ValueError(f"{env_name} is missing. Please set it in backend/.env")
    return value


def queue_training_status(run_name: str, device: str) -> dict[str, Any]:
    resolved_device = detect_best_device(device)
    return _set_training_status(
        status="queued",
        message="Training job queued. Dataset download will start shortly.",
        device=resolved_device,
        run_name=run_name,
        data_yaml=None,
        run_dir=None,
        best_model_path=None,
        started_at=_utc_now(),
        finished_at=None,
        error=None,
    )


def detect_best_device(preferred_device: Optional[str] = "auto") -> str:
    if preferred_device and preferred_device.lower() != "auto":
        return preferred_device

    try:
        import torch

        if torch.cuda.is_available():
            return "0"

        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
    except Exception:
        pass

    return "cpu"


def download_dataset(version_number: int, export_format: str) -> Path:
    api_key = require_setting(settings.ROBOFLOW_API_KEY, "ROBOFLOW_API_KEY")
    workspace = require_setting(settings.ROBOFLOW_WORKSPACE, "ROBOFLOW_WORKSPACE")
    project_name = require_setting(settings.ROBOFLOW_PROJECT, "ROBOFLOW_PROJECT")

    DATASET_ROOT.mkdir(parents=True, exist_ok=True)
    download_dir = DATASET_ROOT / f"{project_name}_v{version_number}_{export_format}"

    rf = Roboflow(api_key=api_key)
    project = rf.workspace(workspace).project(project_name)
    version = project.version(version_number)
    dataset = version.download(export_format, location=str(download_dir), overwrite=True)

    data_yaml = Path(dataset.location) / "data.yaml"
    if not data_yaml.exists():
        raise FileNotFoundError(f"Roboflow dataset downloaded but data.yaml was not found at {data_yaml}")

    return data_yaml


def download_classification_dataset(version_number: int, export_format: str) -> Path:
    api_key = require_setting(settings.ROBOFLOW_API_KEY, "ROBOFLOW_API_KEY")
    workspace = require_setting(settings.ROBOFLOW_WORKSPACE, "ROBOFLOW_WORKSPACE")
    project_name = require_setting(settings.ROBOFLOW_PROJECT, "ROBOFLOW_PROJECT")

    DATASET_ROOT.mkdir(parents=True, exist_ok=True)
    download_dir = DATASET_ROOT / f"{project_name}_v{version_number}_{export_format}"

    rf = Roboflow(api_key=api_key)
    project = rf.workspace(workspace).project(project_name)
    version = project.version(version_number)
    dataset = version.download(export_format, location=str(download_dir), overwrite=True)

    dataset_dir = find_classification_dataset_dir(Path(dataset.location))

    return dataset_dir


def find_classification_dataset_dir(base_dir: Path) -> Path:
    candidates = [base_dir]
    candidates.extend(path for path in base_dir.iterdir() if path.is_dir())

    for candidate in candidates:
        train_dir = candidate / "train"
        valid_dir = candidate / "valid"
        val_dir = candidate / "val"
        test_dir = candidate / "test"
        if train_dir.is_dir() and (valid_dir.is_dir() or val_dir.is_dir() or test_dir.is_dir()):
            return candidate

    discovered_dirs = ", ".join(str(path) for path in candidates) or str(base_dir)
    raise FileNotFoundError(
        "Roboflow classification dataset was downloaded, but no dataset folder with train/valid or train/val was found. "
        f"Checked: {discovered_dirs}"
    )


def resolve_training_inputs(version_number: int, export_format: str) -> tuple[str, Path]:
    if export_format in CLASSIFICATION_EXPORT_FORMATS:
        return "classify", download_classification_dataset(version_number, export_format)

    return "detect", download_dataset(version_number, export_format)


def resolve_model_path(task: str, model_path: Union[str, Path]) -> Path:
    if model_path:
        resolved_model_path = Path(model_path)
        if not resolved_model_path.is_absolute():
            resolved_model_path = BACKEND_ROOT / resolved_model_path
        return resolved_model_path

    if task == "classify":
        return DEFAULT_CLASSIFY_MODEL
    return DEFAULT_DETECT_MODEL


def train_model(
    data_source: Path,
    model_path: Path,
    epochs: int,
    imgsz: int,
    device: str,
    run_name: str,
):
    if model_path.is_absolute() and not model_path.exists():
        raise FileNotFoundError(f"Model weight file not found: {model_path}")

    DEFAULT_RUNS_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO(str(model_path))
    return model.train(
        data=str(data_source),
        epochs=epochs,
        imgsz=imgsz,
        device=device,
        name=run_name,
        project=str(DEFAULT_RUNS_DIR),
    )


def start_training_job(
    *,
    epochs: int = 50,
    imgsz: int = 640,
    device: str = "auto",
    run_name: str = DEFAULT_RUN_NAME,
    version: int = settings.ROBOFLOW_VERSION,
    export_format: str = settings.ROBOFLOW_FORMAT,
    model_path: Union[str, Path] = "",
) -> dict[str, Any]:
    current_status = get_training_status()
    if current_status["status"] == "running":
        raise RuntimeError("A training job is already running.")

    resolved_device = detect_best_device(device)

    current_status = get_training_status()
    if current_status["status"] not in {"running", "queued"}:
        _set_training_status(
            status="running",
            message="Downloading dataset and preparing training job.",
            device=resolved_device,
            run_name=run_name,
            data_yaml=None,
            run_dir=None,
            best_model_path=None,
            started_at=_utc_now(),
            finished_at=None,
            error=None,
        )
    else:
        _set_training_status(
            status="running",
            message="Downloading dataset and preparing training job.",
            device=resolved_device,
            run_name=run_name,
        )

    try:
        task, data_source = resolve_training_inputs(version, export_format)
        resolved_model_path = resolve_model_path(task, model_path)
        _set_training_status(
            message="Dataset downloaded. YOLO training is running.",
            data_yaml=str(data_source),
        )

        results = train_model(
            data_source=data_source,
            model_path=resolved_model_path,
            epochs=epochs,
            imgsz=imgsz,
            device=resolved_device,
            run_name=run_name,
        )

        run_dir = Path(results.save_dir)
        best_model_path = run_dir / "weights" / "best.pt"

        return _set_training_status(
            status="completed",
            message="Training completed successfully.",
            run_dir=str(run_dir),
            best_model_path=str(best_model_path),
            finished_at=_utc_now(),
        )
    except Exception as exc:
        error_message = str(exc)
        if "invalid format for project type multilabel-classification" in error_message:
            error_message = (
                "This Roboflow project is a classification dataset. "
                "Use ROBOFLOW_FORMAT=folder and a classification model such as yolov8n-cls.pt."
            )
        return _set_training_status(
            status="failed",
            message="Training failed.",
            finished_at=_utc_now(),
            error=error_message,
        )


def parse_args():
    parser = argparse.ArgumentParser(
        description="Download a Roboflow dataset and train a YOLO model inside this project."
    )
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs.")
    parser.add_argument("--imgsz", type=int, default=640, help="Training image size.")
    parser.add_argument(
        "--device",
        default="auto",
        help="Training device, for example auto, cpu, 0, cuda, or mps.",
    )
    parser.add_argument("--name", default=DEFAULT_RUN_NAME, help="Training run name.")
    parser.add_argument(
        "--version",
        type=int,
        default=settings.ROBOFLOW_VERSION,
        help="Roboflow dataset version number.",
    )
    parser.add_argument(
        "--format",
        default=settings.ROBOFLOW_FORMAT,
        help="Roboflow export format. Use folder for classification or yolov8 for detection.",
    )
    parser.add_argument(
        "--model",
        default="",
        help="Path to the YOLO weight file. Leave empty to auto-pick a detect or classify model.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    status = start_training_job(
        epochs=args.epochs,
        imgsz=args.imgsz,
        device=args.device,
        run_name=args.name,
        version=args.version,
        export_format=args.format,
        model_path=args.model,
    )

    print(f"Status: {status['status']}")
    print(f"Message: {status['message']}")
    if status.get("device"):
        print(f"Device: {status['device']}")
    if status.get("data_yaml"):
        print(f"Dataset ready: {status['data_yaml']}")
    if status.get("best_model_path"):
        print(f"Best model: {status['best_model_path']}")
    if status.get("run_dir"):
        print(f"Run directory: {status['run_dir']}")
    if status.get("error"):
        raise RuntimeError(status["error"])


if __name__ == "__main__":
    main()
