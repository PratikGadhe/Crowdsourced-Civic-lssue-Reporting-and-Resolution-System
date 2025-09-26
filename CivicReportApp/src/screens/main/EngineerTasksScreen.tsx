import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import API_CONFIG from '../../config/api';
import TaskCompletionModal from './TaskCompletionModal';

interface Task {
  _id: string;
  location: string;
  department: string;
  reportsCount: number;
  status: 'assigned' | 'accepted' | 'in-progress' | 'completed';
  assignedAt: string;
  priority: string;
  notes?: string;
}

const EngineerTasksScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!user?.engineerId) {
      console.log('No engineer ID found');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 Loading tasks for engineer ID:', user.engineerId);
      console.log('🔍 API URL:', `http://localhost:9000/api/tasks/engineer/${user.engineerId}`);
      
      const response = await fetch(API_CONFIG.getUrl(`/tasks/engineer/${user.engineerId}`));
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📋 API Response:', result);
      
      if (result.success) {
        console.log(`✅ Found ${result.data.length} tasks for engineer`);
        setTasks(result.data);
      } else {
        console.log('⚠️ API returned success=false:', result.error);
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Failed to load tasks:', error);
      setTasks([]);
      Alert.alert(
        'Connection Error', 
        'Cannot connect to server. Please check if the backend is running on port 9000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      console.log(`🔄 Updating task ${taskId} to status: ${status}`);
      
      const response = await fetch(API_CONFIG.getUrl(`/tasks/${taskId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          updatedBy: user?.email,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Task update response:', result);
      
      if (result.success) {
        Alert.alert('Success', `Task ${status.replace('-', ' ')} successfully!`);
        loadTasks(); // Refresh tasks from server
        setModalVisible(false);
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      Alert.alert('Error', `Failed to update task: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return COLORS.warning;
      case 'accepted': return COLORS.info;
      case 'in-progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getActionButton = (task: Task) => {
    switch (task.status) {
      case 'assigned':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            onPress={() => updateTaskStatus(task._id, 'accepted')}
          >
            <Text style={styles.actionButtonText}>Accept Task</Text>
          </TouchableOpacity>
        );
      case 'accepted':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            onPress={() => updateTaskStatus(task._id, 'in-progress')}
          >
            <Text style={styles.actionButtonText}>Start Work</Text>
          </TouchableOpacity>
        );
      case 'in-progress':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
            onPress={() => {
              setTaskToComplete(task);
              setCompletionModalVisible(true);
            }}
          >
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <View style={[styles.actionButton, { backgroundColor: COLORS.success, opacity: 0.7 }]}>
            <Text style={styles.actionButtonText}>✓ Completed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        setSelectedTask(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskLocation}>📍 {item.location}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('-', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.taskDetails}>
        <Text style={styles.taskDetail}>🏢 {item.department.charAt(0).toUpperCase() + item.department.slice(1)} Department</Text>
        <Text style={styles.taskDetail}>📋 {item.reportsCount} reports to handle</Text>
        <Text style={styles.taskDetail}>📅 Assigned: {new Date(item.assignedAt).toLocaleDateString()}</Text>
      </View>

      {getActionButton(item)}
    </TouchableOpacity>
  );

  const handleTaskCompletion = async (photos: string[], notes: string) => {
    if (!taskToComplete) return;
    
    try {
      const response = await fetch(API_CONFIG.getUrl(`/tasks/${taskToComplete._id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          notes,
          completionPhotos: photos,
          updatedBy: user?.email,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', 'Task completed successfully!');
        loadTasks(); // Refresh tasks
        setCompletionModalVisible(false);
        setTaskToComplete(null);
      } else {
        throw new Error(result.error || 'Failed to complete task');
      }
    } catch (error) {
      console.error('❌ Failed to complete task:', error);
      throw error; // Re-throw to be handled by modal
    }
  };

  const TaskDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedTask && (
            <View style={styles.modalBody}>
              <Text style={styles.modalLocation}>📍 {selectedTask.location}</Text>
              
              <View style={styles.modalDetails}>
                <Text style={styles.modalDetail}>Department: {selectedTask.department}</Text>
                <Text style={styles.modalDetail}>Reports: {selectedTask.reportsCount} issues</Text>
                <Text style={styles.modalDetail}>Priority: {selectedTask.priority}</Text>
                <Text style={styles.modalDetail}>
                  Status: <Text style={{ color: getStatusColor(selectedTask.status) }}>
                    {selectedTask.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </Text>
                <Text style={styles.modalDetail}>
                  Assigned: {new Date(selectedTask.assignedAt).toLocaleString()}
                </Text>
              </View>

              {selectedTask.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes:</Text>
                  <Text style={styles.notesText}>{selectedTask.notes}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                {getActionButton(selectedTask)}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>
          {tasks.filter(t => t.status === 'assigned').length} Assigned • {' '}
          {tasks.filter(t => t.status === 'in-progress').length} In Progress
        </Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.tasksList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTasks} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
            <Text style={styles.emptySubtitle}>
              New tasks will appear here when assigned by your department
            </Text>
          </View>
        }
      />

      <TaskDetailModal />
      
      <TaskCompletionModal
        visible={completionModalVisible}
        task={taskToComplete}
        onClose={() => {
          setCompletionModalVisible(false);
          setTaskToComplete(null);
        }}
        onComplete={handleTaskCompletion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  tasksList: {
    padding: SPACING.md,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  taskLocation: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  taskDetails: {
    marginBottom: SPACING.md,
  },
  taskDetail: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  actionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  closeButton: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalLocation: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalDetails: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  modalDetail: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  notesContainer: {
    backgroundColor: '#fff3cd',
    padding: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginBottom: SPACING.md,
  },
  notesTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  notesText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  modalActions: {
    marginTop: SPACING.md,
  },
});

export default EngineerTasksScreen;