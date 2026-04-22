interface LogoProps {
  size?: number;
  className?: string;
}

export function ArrowBackIcon({ size = 15, className = "" }: LogoProps) {
  return (
<svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.4987 11.6666L3.33203 7.49998M3.33203 7.49998L7.4987 3.33331M3.33203 7.49998H12.082C12.6839 7.49998 13.2799 7.61853 13.836 7.84887C14.3921 8.0792 14.8973 8.4168 15.3229 8.84241C15.7485 9.26801 16.0861 9.77327 16.3165 10.3293C16.5468 10.8854 16.6654 11.4814 16.6654 12.0833C16.6654 12.6852 16.5468 13.2812 16.3165 13.8373C16.0861 14.3934 15.7485 14.8986 15.3229 15.3242C14.8973 15.7498 14.3921 16.0874 13.836 16.3178C13.2799 16.5481 12.6839 16.6666 12.082 16.6666H9.16536" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

  );
}
