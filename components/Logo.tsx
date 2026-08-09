type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({
  size = 48,
  className = "",
}: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Melitax Montări"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}