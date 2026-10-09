type ContainerProps = {
    children: React.ReactNode;
    className?: string;
  };
  
  export default function Container({
    children,
    className = "",
  }: ContainerProps) {
    return (
      <div className={`container-aw ${className}`}>
        {children}
      </div>
    );
  }