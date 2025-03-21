
import { useState } from 'react';
import { SubjectData, SubjectFolder } from '../../types/faculty';
import { UploadOptionSelection } from './upload/UploadOptionSelection';
import { SemesterSelection } from './upload/SemesterSelection';
import { SubjectCreationForm } from './upload/SubjectCreationForm';

type UploadOption = 'semester' | 'common' | 'placement' | 'subject-folder' | 'direct-upload';
type SemesterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface UploadWorkflowProps {
  onSelectOption: (option: string, data?: any) => void;
  onCancel: () => void;
  showAvailableSubjects?: boolean;
}

export const UploadWorkflow = ({ 
  onSelectOption, 
  onCancel,
  showAvailableSubjects = false
}: UploadWorkflowProps) => {
  const [step, setStep] = useState<'initial' | 'semester-selection' | 'subject-creation'>('initial');
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber | null>(null);

  // Get existing subjects
  const existingSubjects: SubjectFolder[] = window.subjectFolders || [];

  const handleInitialSelection = (option: UploadOption) => {
    if (option === 'semester') {
      setStep('semester-selection');
    } else if (option === 'subject-folder') {
      setStep('subject-creation');
    } else {
      // For common, placement, or direct upload, pass directly to parent
      onSelectOption(option);
    }
  };

  const handleSemesterSelect = (semester: SemesterNumber) => {
    setSelectedSemester(semester);
    setStep('subject-creation');
  };

  const handleCreateSubjectFolders = (newSubjects: SubjectData[]) => {
    onSelectOption('create-subject-folders', { 
      semester: selectedSemester, 
      subjects: newSubjects 
    });
  };

  // Filter existing subjects for the selected semester
  const existingSubjectsForSemester = selectedSemester
    ? existingSubjects.filter(subject => subject.semester === selectedSemester)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {step === 'initial' && (
        <UploadOptionSelection
          onSelectOption={handleInitialSelection}
          onCancel={onCancel}
          showAvailableSubjects={showAvailableSubjects}
          existingSubjects={existingSubjects}
        />
      )}

      {step === 'semester-selection' && (
        <SemesterSelection
          onSemesterSelect={handleSemesterSelect}
          onBack={() => setStep('initial')}
        />
      )}

      {step === 'subject-creation' && (
        <SubjectCreationForm
          selectedSemester={selectedSemester}
          onBack={() => selectedSemester ? setStep('semester-selection') : setStep('initial')}
          onSkipToUpload={() => onSelectOption('direct-upload')}
          onCreateSubjectFolders={handleCreateSubjectFolders}
          existingSubjectsForSemester={existingSubjectsForSemester}
          showAvailableSubjects={showAvailableSubjects}
        />
      )}
    </div>
  );
};
