import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Context to share state between components
interface FilterContextType<T> {
  selection: T[];
  onToggleItem: (item: T) => void;
  onToggleCategory: (category: string, items: T[]) => void;
  expanded: Record<string, boolean>;
  onToggleExpand: (category: string) => void;
  clearAll: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FilterContext = createContext<FilterContextType<any> | undefined>(
  undefined
);

// Hook to use the filter context
const useFilter = <T,>() => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context as FilterContextType<T>;
};

// Root component and provider
interface FilterProps<T> {
  title: string;
  selection: T[];
  onFilterChange: (selectedItems: T[]) => void;
  initialSelected?: T[];
  children?: ReactNode;
}

export const Filter = <T,>({
  title,
  selection,
  onFilterChange,
  initialSelected = [],
  children,
}: FilterProps<T>) => {
  // State for tracking expanded categories
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Initialize with initialSelected on mount
  useEffect(() => {
    if (initialSelected.length > 0 && selection.length === 0) {
      onFilterChange(initialSelected);
    }
  }, []);

  // Handler for toggling individual items
  const handleItemToggle = (item: T) => {
    if (selection.includes(item)) {
      onFilterChange(selection.filter((i) => i !== item));
    } else {
      onFilterChange([...selection, item]);
    }
  };

  // Handler for toggling all items in a category
  const handleCategoryToggle = (category: string, items: T[]) => {
    const allSelected = items.every((item) => selection.includes(item));

    if (allSelected) {
      // If all are selected, remove them all
      onFilterChange(selection.filter((item) => !items.includes(item)));
    } else {
      // Otherwise, add all missing items
      const itemsToAdd = items.filter((item) => !selection.includes(item));
      onFilterChange([...selection, ...itemsToAdd]);
    }
  };

  // Handler for toggling category expansion
  const toggleCategory = (category: string) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handler for clearing all selections
  const clearAll = () => {
    onFilterChange([]);
  };

  // Context value to share with children
  const contextValue: FilterContextType<T> = {
    selection,
    onToggleItem: handleItemToggle,
    onToggleCategory: handleCategoryToggle,
    expanded,
    onToggleExpand: toggleCategory,
    clearAll,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-bold text-secondary mb-3">{title}</h2>
        {children}
      </div>
    </FilterContext.Provider>
  );
};

// Category component
interface CategoryProps<T> {
  name: string;
  items: T[];
  label?: string;
  children?: ReactNode;
}

const Category = <T,>({ name, items, label, children }: CategoryProps<T>) => {
  const { selection, onToggleCategory, expanded, onToggleExpand } =
    useFilter<T>();

  const isExpanded = expanded[name];
  const allSelected = items.every((item) => selection.includes(item));
  const someSelected = items.some((item) => selection.includes(item));

  return (
    <div className="mb-3">
      <div className="flex items-center">
        {/* Category checkbox */}
        <div
          className="cursor-pointer mr-2 flex items-center"
          onClick={() => onToggleCategory(name, items)}
        >
          <div
            className={`w-4 h-4 border ${
              someSelected ? "bg-secondary border-secondary" : "border-gray-400"
            } rounded flex items-center justify-center`}
          >
            {allSelected && <span className="text-white text-xs">✓</span>}
            {someSelected && !allSelected && (
              <span className="text-white text-xs">-</span>
            )}
          </div>
        </div>

        {/* Expandable category label */}
        <div
          className="flex-1 font-medium cursor-pointer flex items-center"
          onClick={() => onToggleExpand(name)}
        >
          {label || name}
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>

      {/* Children (items) */}
      {isExpanded && <div className="ml-6 mt-2 space-y-1">{children}</div>}
    </div>
  );
};

// Item component
interface ItemProps<T> {
  value: T;
  label?: string;
}

const Item = <T,>({ value, label }: ItemProps<T>) => {
  const { selection, onToggleItem } = useFilter<T>();
  const isSelected = selection.includes(value);

  return (
    <div className="flex items-center">
      <div
        className="cursor-pointer mr-2 flex items-center"
        onClick={() => onToggleItem(value)}
      >
        <div
          className={`w-4 h-4 border ${
            isSelected ? "bg-secondary border-secondary" : "border-gray-400"
          } rounded flex items-center justify-center`}
        >
          {isSelected && <span className="text-white text-xs">✓</span>}
        </div>
      </div>
      <span
        className="capitalize text-sm cursor-pointer"
        onClick={() => onToggleItem(value)}
      >
        {label || String(value)}
      </span>
    </div>
  );
};

// Clear button component
const ClearButton = () => {
  const { selection, clearAll } = useFilter();

  if (selection.length === 0) return null;

  return (
    <button
      className="mt-2 text-sm text-primary hover:text-hover"
      onClick={clearAll}
    >
      Clear all filters
    </button>
  );
};

// Attach subcomponents to Filter
Filter.Category = Category;
Filter.Item = Item;
Filter.ClearButton = ClearButton;
