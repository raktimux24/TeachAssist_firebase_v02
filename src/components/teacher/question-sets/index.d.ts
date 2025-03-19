declare module '../../components/teacher/question-sets/QuestionSetsFilters' {
  interface QuestionSetsFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedSubject: string;
    onSubjectChange: (value: string) => void;
    selectedClass: string;
    onClassChange: (value: string) => void;
    selectedDifficulty: string;
    onDifficultyChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
  }
  
  const QuestionSetsFilters: React.FC<QuestionSetsFiltersProps>;
  export default QuestionSetsFilters;
}

declare module '../../components/teacher/question-sets/QuestionSetsTable' {
  import { QuestionSet } from '../../services/questionSetGeneration';
  
  interface QuestionSetsTableProps {
    questionSets: QuestionSet[];
    onView: (id: string) => void;
    onDelete: (id: string) => void;
  }
  
  const QuestionSetsTable: React.FC<QuestionSetsTableProps>;
  export default QuestionSetsTable;
}

declare module '../../components/teacher/question-sets/QuestionSetsGrid' {
  import { QuestionSet } from '../../services/questionSetGeneration';
  
  interface QuestionSetsGridProps {
    questionSets: QuestionSet[];
    onView: (id: string) => void;
    onDelete: (id: string) => void;
  }
  
  const QuestionSetsGrid: React.FC<QuestionSetsGridProps>;
  export default QuestionSetsGrid;
}

declare module '../../components/teacher/question-sets/QuestionSetsActionPanel' {
  interface QuestionSetsActionPanelProps {
    onCreateNew: () => void;
  }
  
  const QuestionSetsActionPanel: React.FC<QuestionSetsActionPanelProps>;
  export default QuestionSetsActionPanel;
}
