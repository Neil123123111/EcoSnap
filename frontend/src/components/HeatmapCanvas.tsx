import { useEffect, useRef } from "react";

export default function HeatmapCanvas({ image, boxes }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      boxes.forEach((box: any) => {
        // 🔥 heatmap
        const gradient = ctx.createRadialGradient(
          box.x,
          box.y,
          10,
          box.x,
          box.y,
          80
        );

        gradient.addColorStop(0, "rgba(255,0,0,0.6)");
        gradient.addColorStop(1, "rgba(255,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(
          box.x - box.width / 2,
          box.y - box.height / 2,
          box.width,
          box.height
        );

        // 🔥 bounding box
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          box.x - box.width / 2,
          box.y - box.height / 2,
          box.width,
          box.height
        );
      });
    };
  }, [image, boxes]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg w-full h-32 object-cover"
    />
  );
}