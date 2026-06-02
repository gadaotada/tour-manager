import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@components/ui/input";
import { cn } from "@libs/utils";

type SearchInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "type" | "value"
> & {
  onSearchChange: (value: string) => void;
  value: string;
  wrapperClassName?: string;
};

function SearchInput({
  className,
  onSearchChange,
  value,
  wrapperClassName,
  ...props
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  function commitSearch() {
    const normalizedInputValue = inputValue.trim();
    const normalizedValue = value.trim();

    if (normalizedInputValue !== normalizedValue) {
      onSearchChange(normalizedInputValue);
    }

    setInputValue(normalizedInputValue);
  }

  return (
    <div className={cn("relative", wrapperClassName)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        className={cn("pl-9", className)}
        type="search"
        value={inputValue}
        onBlur={commitSearch}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitSearch();
          }
        }}
      />
    </div>
  );
}

export { SearchInput, type SearchInputProps };
