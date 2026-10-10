'use client';

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        className || ""
      }`}
      style={{
        display: "flex",
        height: "40px",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "6px",
        border: "1px solid var(--line)",
        backgroundColor: "var(--paper)",
        padding: "8px 12px",
        fontSize: "14px",
        color: "var(--ink)",
        cursor: "pointer",
        ...props.style,
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown style={{ opacity: 0.5, height: "16px", width: "16px" }} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-md ${
          className || ""
        }`}
        position={position}
        style={{
          zIndex: 1000,
          minWidth: "8rem",
          overflow: "hidden",
          borderRadius: "6px",
          border: "1px solid var(--line)",
          backgroundColor: "var(--paper)",
          color: "var(--ink)",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          ...props.style,
        }}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={`p-1 ${
            position === "popper"
              ? "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
              : ""
          }`}
          style={{ padding: "4px" }}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-neutral-100 focus:text-neutral-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        className || ""
      }`}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        cursor: "pointer",
        userSelect: "none",
        alignItems: "center",
        borderRadius: "4px",
        padding: "10px 12px 10px 32px",
        margin: "4px 0",
        fontSize: "14px",
        color: "var(--ink)",
        outline: "none",
        ...props.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--soft-gold)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      {...props}
    >
      <span
        className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
        style={{
          position: "absolute",
          left: "8px",
          display: "flex",
          height: "14px",
          width: "14px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SelectPrimitive.ItemIndicator>
          <Check style={{ height: "16px", width: "16px" }} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
