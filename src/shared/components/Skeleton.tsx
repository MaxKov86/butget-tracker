interface SkeletonProps {
  className?: string;
}

/**
 * Tailwind вже має вбудований animate-pulse — на відміну від проекту 1
 * (vanilla CSS), де shimmer-анімацію довелось писати вручну через
 * @keyframes, тут достатньо utility-класу.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-surface-2 ${className}`} />;
}
