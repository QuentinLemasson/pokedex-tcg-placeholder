import { Filter } from "./FilterContainer";

interface GenerationFilterProps {
  selection: number[];
  onFilterChange: (selectedGenerations: number[]) => void;
}

export const GenerationFilter = ({
  selection,
  onFilterChange,
}: GenerationFilterProps) => {
  // Create an array of generations from 1 to 9
  const generations = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <Filter<number>
      title="Filter by Generation"
      selection={selection}
      onFilterChange={onFilterChange}
    >
      <div className="flex flex-col gap-2">
        <Filter.Category
          name="generations"
          items={generations}
          label="All Generations"
        >
          {generations.map((gen) => (
            <Filter.Item key={gen} value={gen} label={`Generation ${gen}`} />
          ))}
        </Filter.Category>
      </div>
      <div className="flex justify-center">
        <Filter.ClearButton />
      </div>
    </Filter>
  );
};
