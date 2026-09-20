import React from "react";
import { BloodGroup } from "../../types";

interface BloodGroupBadgeProps {
  group?: BloodGroup | string | null;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "outline" | "subtle";
  showDropIcon?: boolean;
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({
  group,
  size = "md",
  variant = "solid",
  showDropIcon = false,
}) => {
  // ✅ Never let group be undefined
  const bloodGroup = (group ?? "UNKNOWN").toString();

  const isNegative = bloodGroup.includes("-");

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 font-bold",
    md: "text-sm px-2.5 py-1 font-bold",
    lg: "text-base px-3.5 py-1.5 font-bold tracking-tight",
    xl: "text-xl px-5 py-2 font-extrabold tracking-tight",
  };

  const variantClasses = {
    solid: isNegative
      ? "bg-red-600 text-white shadow-sm"
      : "bg-slate-900 text-white shadow-sm",

    outline: isNegative
      ? "border border-red-600 text-red-600 bg-red-50"
      : "border border-slate-300 text-slate-800 bg-slate-50",

    subtle: isNegative
      ? "bg-red-100 text-red-600"
      : "bg-slate-100 text-slate-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xl uppercase ${sizeClasses[size]} ${variantClasses[variant]}`}
      id={`badge-blood-${bloodGroup.replace("+", "pos").replace("-", "neg")}`}
    >
      {showDropIcon && <span className="text-[0.75em]">🩸</span>}

      <span>{bloodGroup}</span>

      {isNegative && bloodGroup !== "UNKNOWN" && (
        <span className="text-[0.65em] font-medium opacity-80">
          UNIVERSAL
        </span>
      )}
    </span>
  );
};