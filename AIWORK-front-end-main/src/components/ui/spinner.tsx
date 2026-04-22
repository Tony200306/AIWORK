import { cn } from "@/lib/utils"

interface SpinnerProps extends Omit<React.ComponentProps<"div">, "style"> {
  color?: string
  icon?: React.ReactNode
  size?: number
  strokeWidth?: number
}

function Spinner({ className, color, icon, size = 40, strokeWidth = 4, ...props }: SpinnerProps) {
  // Đảm bảo luôn có giá trị màu để dùng trong chuỗi string, nếu không có thì fallback về currentColor
  const activeColor = color || "currentColor";

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("relative inline-block", className)}
      {...props}
    >
      <div
        className="animate-spin"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          /* Vẫn giữ color ở đây để các thuộc tính khác (nếu có) kế thừa */
          color: activeColor, 
          
          /* FIX: Truyền trực tiếp biến activeColor vào chuỗi string thay vì dùng currentColor */
          background: `conic-gradient(from 0deg, transparent 0%, ${activeColor} 100%)`,

          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${strokeWidth}px), black calc(100% - ${strokeWidth}px))`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${strokeWidth}px), black calc(100% - ${strokeWidth}px))`,
        }}
      >
        {/* Chấm tròn (Cap) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${strokeWidth}px`,
            height: `${strokeWidth}px`,
            
            /* FIX: Dùng trực tiếp activeColor */
            backgroundColor: activeColor,
            borderRadius: '50%',
            
            /* FIX: Dùng trực tiếp activeColor cho bóng đổ */
            boxShadow: `0 0 ${strokeWidth}px ${activeColor}`, 
          }}
        />
      </div>

      {/* Center icon */}
      {icon && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontSize: `${size * 0.4}px`,
            /* Icon wrapper nhận màu */
            color: activeColor,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  )
}

export { Spinner }