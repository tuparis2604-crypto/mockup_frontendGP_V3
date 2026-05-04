interface PageIntroProps {
  text: string;
  className?: string;
}

export default function PageIntro({ text, className = "" }: PageIntroProps) {
  return (
    <div className={`p-4 bg-secondary/60 border border-border rounded-lg mb-6 ${className}`}>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
