import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Group form types by category
const formTypeCategories = {
  regional: ["alola", "galar", "hisui", "paldea"],
  transformations: ["mega", "gmax", "eternamax", "weather"],
  specialForms: [
    "cap",
    "cosplay",
    "starter",
    "totem",
    "three-segment",
    "unknown",
    "bloodmoon",
    "deoxys",
    "wormadam",
    "zenith",
    "occident",
    "origin",
    "rotom",
    "primal",
    "therian",
    "kyurem",
    "keldeo",
    "meloetta",
    "meowstic",
    "female",
    "meteor",
    "necrozma",
    "eternal",
    "ash",
    "battle-bond",
    "blade",
    "size",
    "zygarde",
    "unbound",
    "nigosier",
    "low-key",
    "calyrex",
    "busted",
    "noice",
    "crowned",
    "rapid-strike",
    "family-of-three",
    "plumage",
    "hero",
    "nigirigon",
    "buid",
    "ogerpon-mask",
    "terastal",
  ],
};

// Category labels for display
const categoryLabels: Record<string, string> = {
  regional: "Regional Forms",
  transformations: "Transformations",
  specialForms: "Special Forms",
  other: "Other Forms",
};

// Context to share state between components
interface FormFilterContextType {
  selection: string[];
  onToggleForm: (form: string) => void;
  onToggleCategory: (category: string, forms: string[]) => void;
  expanded: Record<string, boolean>;
  onToggleExpand: (category: string) => void;
  clearAll: () => void;
}

const FormFilterContext = createContext<FormFilterContextType | undefined>(
  undefined
);

// Hook to use the form filter context
const useFormFilter = () => {
  const context = useContext(FormFilterContext);
  if (!context) {
    throw new Error("useFormFilter must be used within a FormFilterProvider");
  }
  return context;
};

// Root component and provider
interface FormFilterProps {
  selection: string[];
  onFilterChange: (selectedForms: string[]) => void;
  initialSelected?: string[];
  children?: ReactNode;
}

export const FormFilter = ({
  selection,
  onFilterChange,
  initialSelected = [],
  children,
}: FormFilterProps) => {
  // State for tracking expanded categories
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    regional: true,
    transformations: true,
    specialForms: false,
    other: false,
  });

  // Initialize with initialSelected on mount
  useEffect(() => {
    if (initialSelected.length > 0 && selection.length === 0) {
      onFilterChange(initialSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for toggling individual form types
  const handleFormToggle = (form: string) => {
    if (selection.includes(form)) {
      onFilterChange(selection.filter((f) => f !== form));
    } else {
      onFilterChange([...selection, form]);
    }
  };

  // Handler for toggling all forms in a category
  const handleCategoryToggle = (category: string, forms: string[]) => {
    const allSelected = forms.every((form) => selection.includes(form));

    if (allSelected) {
      // If all are selected, remove them all
      onFilterChange(selection.filter((form) => !forms.includes(form)));
    } else {
      // Otherwise, add all missing forms
      const formsToAdd = forms.filter((form) => !selection.includes(form));
      onFilterChange([...selection, ...formsToAdd]);
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
  const contextValue: FormFilterContextType = {
    selection,
    onToggleForm: handleFormToggle,
    onToggleCategory: handleCategoryToggle,
    expanded,
    onToggleExpand: toggleCategory,
    clearAll,
  };

  return (
    <FormFilterContext.Provider value={contextValue}>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-bold text-secondary mb-3">
          Filter by Form Types
        </h2>
        {children}
      </div>
    </FormFilterContext.Provider>
  );
};

// Category component
interface CategoryProps {
  name: string;
  forms: string[];
  label?: string;
  children?: ReactNode;
}

const Category = ({ name, forms, label, children }: CategoryProps) => {
  const { selection, onToggleCategory, expanded, onToggleExpand } =
    useFormFilter();

  const isExpanded = expanded[name];
  const allSelected = forms.every((form) => selection.includes(form));
  const someSelected = forms.some((form) => selection.includes(form));

  return (
    <div className="mb-3">
      <div className="flex items-center">
        {/* Category checkbox */}
        <div
          className="cursor-pointer mr-2 flex items-center"
          onClick={() => onToggleCategory(name, forms)}
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
          {label || categoryLabels[name as keyof typeof categoryLabels] || name}
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

      {/* Children (form items) */}
      {isExpanded && <div className="ml-6 mt-2 space-y-1">{children}</div>}
    </div>
  );
};

// Form item component
interface FormItemProps {
  value: string;
  label?: string;
}

const FormItem = ({ value, label }: FormItemProps) => {
  const { selection, onToggleForm } = useFormFilter();
  const isSelected = selection.includes(value);

  return (
    <div className="flex items-center">
      <div
        className="cursor-pointer mr-2 flex items-center"
        onClick={() => onToggleForm(value)}
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
        onClick={() => onToggleForm(value)}
      >
        {label || value}
      </span>
    </div>
  );
};

// Clear button component
const ClearButton = () => {
  const { selection, clearAll } = useFormFilter();

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

// Attach subcomponents to FormFilter
FormFilter.Category = Category;
FormFilter.FormItem = FormItem;
FormFilter.ClearButton = ClearButton;

// Container component that maintains backward compatibility
export const FormFilterContainer = (props: FormFilterProps) => {
  return (
    <FormFilter {...props}>
      {Object.entries(formTypeCategories).map(([category, forms]) => (
        <FormFilter.Category key={category} name={category} forms={forms}>
          {forms.map((form) => (
            <FormFilter.FormItem key={form} value={form} />
          ))}
        </FormFilter.Category>
      ))}
      <div className="flex justify-center">
        <FormFilter.ClearButton />
      </div>
    </FormFilter>
  );
};
