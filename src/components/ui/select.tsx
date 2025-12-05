"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("useSelect must be used within a Select component")
  }
  return context
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

function Select({ children, value: controlledValue, onValueChange, defaultValue = "" }: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue
  const setValue = isControlled ? onValueChange! : setUncontrolledValue

  return (
    <SelectContext.Provider value={{ value, onValueChange: setValue, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect()
    
    return (
      <button
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelect()
  
  return (
    <span className={cn(!value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  )
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelect()
  const ref = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelect()
  const isSelected = value === selectedValue
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent/50",
        className
      )}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

