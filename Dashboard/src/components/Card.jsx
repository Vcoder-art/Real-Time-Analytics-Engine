export default function Card({ title, subtitle, children ,className }) {
  
    const classNameStyles = "w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-gray-200/60 p-8 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] " + className
  
    return (
    <div className={classNameStyles}>
      <div className="text-center mb-6">
        {title && (
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            {title}
          </h2>
        )}
        {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}
