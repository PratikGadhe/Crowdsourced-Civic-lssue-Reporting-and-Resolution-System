import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  Image,
} from 'react-native';
import {COLORS, TYPOGRAPHY, SPACING} from '../../utils/constants';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  address: string;
  images: string[];
  reportedAt: string;
  updatedAt: string;
  progress: {
    step: number;
    totalSteps: number;
    message: string;
    updatedAt: string;
  };
  upvotes: number;
  comments: number;
}

// Mock user reports data
const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues and vehicle damage. Located near the intersection.',
    category: 'roads',
    priority: 'high',
    status: 'in-progress',
    address: 'Main Street, Downtown Area',
    images: [],
    reportedAt: '2024-01-15',
    updatedAt: '2024-01-18',
    progress: {
      step: 2,
      totalSteps: 4,
      message: 'Work crew assigned, repair scheduled for next week',
      updatedAt: '2024-01-18',
    },
    upvotes: 23,
    comments: 5,
  },
  {
    id: '2',
    title: 'Street Light Not Working',
    description: 'Street light has been out for 3 days, creating safety concerns for pedestrians.',
    category: 'electricity',
    priority: 'medium',
    status: 'resolved',
    address: 'Pine Street, Near Central Park',
    images: [],
    reportedAt: '2024-01-10',
    updatedAt: '2024-01-16',
    progress: {
      step: 4,
      totalSteps: 4,
      message: 'Issue resolved - new bulb installed and tested',
      updatedAt: '2024-01-16',
    },
    upvotes: 12,
    comments: 3,
  },
  {
    id: '3',
    title: 'Overflowing Garbage Bin',
    description: 'Public garbage bin is overflowing, attracting pests and creating unsanitary conditions.',
    category: 'waste',
    priority: 'low',
    status: 'pending',
    address: 'Central Park, East Gate',
    images: [],
    reportedAt: '2024-01-12',
    updatedAt: '2024-01-12',
    progress: {
      step: 1,
      totalSteps: 3,
      message: 'Report received and under review',
      updatedAt: '2024-01-12',
    },
    upvotes: 8,
    comments: 2,
  },
  {
    id: '4',
    title: 'Water Leakage',
    description: 'Broken water pipe flooding the street, urgent repair needed.',
    category: 'water',
    priority: 'critical',
    status: 'rejected',
    address: 'Oak Avenue, Block 5',
    images: [],
    reportedAt: '2024-01-08',
    updatedAt: '2024-01-14',
    progress: {
      step: 1,
      totalSteps: 1,
      message: 'Issue was duplicate of existing report #WTR-2024-001',
      updatedAt: '2024-01-14',
    },
    upvotes: 15,
    comments: 7,
  },
];

const CATEGORY_INFO = {
  roads: {icon: '🛣️', name: 'Roads & Traffic', color: '#FF6B6B'},
  water: {icon: '💧', name: 'Water Supply', color: '#4ECDC4'},
  electricity: {icon: '⚡', name: 'Electricity', color: '#FFE66D'},
  waste: {icon: '🗑️', name: 'Waste Management', color: '#95E1D3'},
  public: {icon: '🏛️', name: 'Public Facilities', color: '#A8E6CF'},
  other: {icon: '📝', name: 'Other', color: '#C7CEEA'},
};

const STATUS_INFO = {
  pending: {color: '#FF9800', label: 'Pending Review', icon: '⏳'},
  'in-progress': {color: '#2196F3', label: 'In Progress', icon: '🔧'},
  resolved: {color: '#4CAF50', label: 'Resolved', icon: '✅'},
  rejected: {color: '#F44336', label: 'Rejected', icon: '❌'},
};

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0',
};

const MyReportsScreen: React.FC = () => {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved' | 'rejected'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated', 'Your reports have been refreshed');
    }, 1500);
  };

  const getFilteredReports = () => {
    if (filter === 'all') return reports;
    return reports.filter(report => report.status === filter);
  };

  const getProgressPercentage = (report: Report) => {
    return (report.progress.step / report.progress.totalSteps) * 100;
  };

  const renderProgressBar = (report: Report) => {
    const percentage = getProgressPercentage(report);
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${percentage}%`}]} />
        </View>
        <Text style={styles.progressText}>
          {report.progress.step}/{report.progress.totalSteps} steps completed
        </Text>
      </View>
    );
  };

  const renderReportCard = ({item}: {item: Report}) => {
    const categoryInfo = CATEGORY_INFO[item.category as keyof typeof CATEGORY_INFO];
    const statusInfo = STATUS_INFO[item.status];

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => setSelectedReport(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text style={styles.categoryIcon}>{categoryInfo?.icon}</Text>
            <Text style={styles.cardTitleText} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardLocation}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {item.status !== 'rejected' && renderProgressBar(item)}

        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>👍</Text>
              <Text style={styles.statText}>{item.upvotes}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statText}>{item.comments}</Text>
            </View>
            <View style={[styles.priorityBadge, {backgroundColor: PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS]}]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>Updated: {item.updatedAt}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStats = () => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      inProgress: reports.filter(r => r.status === 'in-progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getStats();
  const filteredReports = getFilteredReports();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Reports</Text>
        <Text style={styles.headerSubtitle}>Track your civic issue reports</Text>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statCardNumber}>{stats.total}</Text>
          <Text style={styles.statCardLabel}>Total Reports</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: STATUS_INFO.pending.color + '20'}]}>
          <Text style={[styles.statCardNumber, {color: STATUS_INFO.pending.color}]}>{stats.pending}</Text>
          <Text style={styles.statCardLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: STATUS_INFO['in-progress'].color + '20'}]}>
          <Text style={[styles.statCardNumber, {color: STATUS_INFO['in-progress'].color}]}>{stats.inProgress}</Text>
          <Text style={styles.statCardLabel}>In Progress</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: STATUS_INFO.resolved.color + '20'}]}>
          <Text style={[styles.statCardNumber, {color: STATUS_INFO.resolved.color}]}>{stats.resolved}</Text>
          <Text style={styles.statCardLabel}>Resolved</Text>
        </View>
      </ScrollView>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'in-progress', 'resolved', 'rejected'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status as any)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === status && styles.filterButtonTextActive,
            ]}>
              {status === 'all' ? 'All' : STATUS_INFO[status as keyof typeof STATUS_INFO]?.label || status} 
              ({status === 'all' ? reports.length : reports.filter(r => r.status === status).length})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'Start reporting issues to see them here' 
                : `No ${filter} reports at the moment`}
            </Text>
          </View>
        }
      />

      {/* Report Details Modal */}
      <Modal
        visible={selectedReport !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle}>{selectedReport.title}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSelectedReport(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalBadges}>
                    <View style={[styles.badge, {backgroundColor: CATEGORY_INFO[selectedReport.category as keyof typeof CATEGORY_INFO]?.color}]}>
                      <Text style={styles.badgeText}>
                        {CATEGORY_INFO[selectedReport.category as keyof typeof CATEGORY_INFO]?.icon} {selectedReport.category}
                      </Text>
                    </View>
                    <View style={[styles.badge, {backgroundColor: STATUS_INFO[selectedReport.status].color}]}>
                      <Text style={styles.badgeText}>
                        {STATUS_INFO[selectedReport.status].icon} {STATUS_INFO[selectedReport.status].label}
                      </Text>
                    </View>
                  </View>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📝 Description</Text>
                    <Text style={styles.modalSectionText}>{selectedReport.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📍 Location</Text>
                    <Text style={styles.modalSectionText}>{selectedReport.address}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📊 Progress Update</Text>
                    <Text style={styles.modalSectionText}>{selectedReport.progress.message}</Text>
                    {selectedReport.status !== 'rejected' && (
                      <View style={styles.modalProgressContainer}>
                        {renderProgressBar(selectedReport)}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📅 Timeline</Text>
                    <Text style={styles.modalSectionText}>
                      Reported: {selectedReport.reportedAt}{'\n'}
                      Last Updated: {selectedReport.updatedAt}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>📤 Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, {backgroundColor: COLORS.error}]}>
                    <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginRight: SPACING.md,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statCardLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SPACING.md,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  cardTitleText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 14,
  },
  cardDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  statText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  priorityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 10,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  modalBody: {
    maxHeight: 300,
  },
  modalSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalSectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalSectionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  modalProgressContainer: {
    marginTop: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default MyReportsScreen;