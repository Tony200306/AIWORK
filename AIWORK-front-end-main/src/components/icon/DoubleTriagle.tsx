interface LogoProps {
  size?: number;
  className?: string;
}

export function DoubleTriagle({ size = 15, className = "" }: LogoProps) {
  return (
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16665 10.8333L9.99998 18.3333L15.8333 10.8333H4.16665Z" stroke="#59A1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M4.16665 1.66663L9.99998 9.16663L15.8333 1.66663H4.16665Z" stroke="#59A1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

  );
}
