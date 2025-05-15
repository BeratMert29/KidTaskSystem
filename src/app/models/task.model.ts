export interface Task {
  id?: number;
  title: string;
  description: string;
  reward: number;
  deadline: Date;
  duration?: number; // in minutes, now optional
  assignedTo: {
    id: number;
    username: string;
    role: 'STUDENT' | 'TEACHER' | 'PARENT';
  };
  status: 'pending' | 'awaiting_approval' | 'completed' | 'approved' | 'rejected';
  rating?: number;
  notes?: string;
  completionDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreateDto {
  title: string;
  description: string;
  reward: string;
  deadline: Date;
  duration?: number; // now optional
  assignedTo: number;
}

export interface TaskUpdateDto {
  title?: string;
  description?: string;
  reward?: string;
  deadline?: Date;
  duration?: number;
  status?: 'pending' | 'awaiting_approval' | 'completed' | 'approved' | 'rejected';
  rating?: number;
  reviewNotes?: string;
} 