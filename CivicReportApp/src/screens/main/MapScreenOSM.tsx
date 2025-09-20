import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {COLORS, TYPOGRAPHY, SPACING} from '../../utils/constants';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'pending' | 'in-progress' | 'resolved';
  reportedAt: string;
  reportedBy: string;
}

// Mock data with realistic coordinates (San Francisco area)
const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'roads',
    priority: 'high',
    latitude: 37.7749,
    longitude: -122.4194,
    address: 'Main Street, Downtown',
    status: 'pending',
    reportedAt: '2024-01-15',
    reportedBy: 'John Doe',
  },
  {
    id: '2',
    title: 'Water Leakage',
    description: 'Broken water pipe flooding the street',
    category: 'water',
    priority: 'critical',
    latitude: 37.7849,
    longitude: -122.4094,
    address: 'Oak Avenue, Block 5',
    status: 'in-progress',
    reportedAt: '2024-01-14',
    reportedBy: 'Jane Smith',
  },
  {
    id: '3',
    title: 'Street Light Not Working',
    description: 'Street light has been out for 3 days',
    category: 'electricity',
    priority: 'medium',
    latitude: 37.7649,
    longitude: -122.4294,
    address: 'Pine Street, Near Park',
    status: 'resolved',
    reportedAt: '2024-01-13',
    reportedBy: 'Mike Johnson',
  },
  {
    id: '4',
    title: 'Overflowing Garbage Bin',
    description: 'Public garbage bin is overflowing',
    category: 'waste',
    priority: 'low',
    latitude: 37.7549,
    longitude: -122.4394,
    address: 'Central Park, East Gate',
    status: 'pending',
    reportedAt: '2024-01-12',
    reportedBy: 'Sarah Wilson',
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

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0',
};

const STATUS_INFO = {
  pending: {color: '#FF9800', label: 'Pending', icon: '⏳'},
  'in-progress': {color: '#2196F3', label: 'In Progress', icon: '🔧'},
  resolved: {color: '#4CAF50', label: 'Resolved', icon: '✅'},
};

const MapScreen: React.FC = () => {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.log('Location error:', error);
    }
    setLoading(false);
  };

  const getFilteredIssues = () => {
    if (filter === 'all') return issues;
    return issues.filter(issue => issue.status === filter);
  };

  const getMarkerColor = (issue: Issue) => {
    const categoryInfo = CATEGORY_INFO[issue.category as keyof typeof CATEGORY_INFO];
    return categoryInfo?.color || COLORS.primary;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Issue Map</Text>
        <Text style={styles.headerSubtitle}>Tap markers to see details</Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'in-progress', 'resolved'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filter === status && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(status as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === status && styles.filterButtonTextActive,
                ]}
              >
                {status === 'all' ? 'All' : STATUS_INFO[status as keyof typeof STATUS_INFO].label} 
                ({status === 'all' ? issues.length : issues.filter(i => i.status === status).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
        mapType="standard"
      >
        {getFilteredIssues().map(issue => (
          <Marker
            key={issue.id}
            coordinate={{
              latitude: issue.latitude,
              longitude: issue.longitude,
            }}
            onPress={() => setSelectedIssue(issue)}
          >
            <View style={[styles.customMarker, {backgroundColor: getMarkerColor(issue)}]}>
              <Text style={styles.markerText}>
                {CATEGORY_INFO[issue.category as keyof typeof CATEGORY_INFO]?.icon || '📝'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Issue Details Modal */}
      <Modal
        visible={selectedIssue !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedIssue(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedIssue && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle}>{selectedIssue.title}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSelectedIssue(null)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalBadges}>
                    <View style={[styles.badge, {backgroundColor: getMarkerColor(selectedIssue)}]}>
                      <Text style={styles.badgeText}>
                        {CATEGORY_INFO[selectedIssue.category as keyof typeof CATEGORY_INFO]?.icon} {selectedIssue.category}
                      </Text>
                    </View>
                    <View style={[styles.badge, {backgroundColor: PRIORITY_COLORS[selectedIssue.priority as keyof typeof PRIORITY_COLORS]}]}>
                      <Text style={styles.badgeText}>{selectedIssue.priority}</Text>
                    </View>
                    <View style={[styles.badge, {backgroundColor: STATUS_INFO[selectedIssue.status].color}]}>
                      <Text style={styles.badgeText}>
                        {STATUS_INFO[selectedIssue.status].icon} {STATUS_INFO[selectedIssue.status].label}
                      </Text>
                    </View>
                  </View>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📍 Location</Text>
                    <Text style={styles.modalSectionText}>{selectedIssue.address}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📝 Description</Text>
                    <Text style={styles.modalSectionText}>{selectedIssue.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>👤 Reported By</Text>
                    <Text style={styles.modalSectionText}>{selectedIssue.reportedBy}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>📅 Reported On</Text>
                    <Text style={styles.modalSectionText}>{selectedIssue.reportedAt}</Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>👍 Support</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>💬 Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>📍 Navigate</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{issues.filter(i => i.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{issues.filter(i => i.status === 'in-progress').length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{issues.filter(i => i.status === 'resolved').length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  filterBar: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
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
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 16,
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
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default MapScreen;