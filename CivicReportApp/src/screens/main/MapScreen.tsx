import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
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
  images: string[];
  status: 'pending' | 'in-progress' | 'resolved';
  reportedAt: string;
  reportedBy: string;
}

// Mock data for demonstration
const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'roads',
    priority: 'high',
    latitude: 37.78825,
    longitude: -122.4324,
    address: 'Main Street, Downtown',
    images: [],
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
    latitude: 37.78925,
    longitude: -122.4334,
    address: 'Oak Avenue, Block 5',
    images: [],
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
    latitude: 37.78725,
    longitude: -122.4314,
    address: 'Pine Street, Near Park',
    images: [],
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
    latitude: 37.78625,
    longitude: -122.4304,
    address: 'Central Park, East Gate',
    images: [],
    status: 'pending',
    reportedAt: '2024-01-12',
    reportedBy: 'Sarah Wilson',
  },
];

const CATEGORY_COLORS = {
  roads: '#FF6B6B',
  water: '#4ECDC4',
  electricity: '#FFE66D',
  waste: '#95E1D3',
  public: '#A8E6CF',
  other: '#C7CEEA',
};

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0',
};

const STATUS_COLORS = {
  pending: '#FF9800',
  'in-progress': '#2196F3',
  resolved: '#4CAF50',
};

const MapScreen: React.FC = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
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
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your location');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
    setLoading(false);
  };

  const getMarkerColor = (issue: Issue) => {
    return CATEGORY_COLORS[issue.category as keyof typeof CATEGORY_COLORS] || COLORS.primary;
  };

  const getFilteredIssues = () => {
    if (filter === 'all') return issues;
    return issues.filter(issue => issue.status === filter);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      roads: '🛣️',
      water: '💧',
      electricity: '⚡',
      waste: '🗑️',
      public: '🏛️',
      other: '📝',
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
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
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'in-progress', 'resolved'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filter === status && styles.filterButtonActive,
                {borderColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || COLORS.primary},
              ]}
              onPress={() => setFilter(status as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === status && styles.filterButtonTextActive,
                ]}
              >
                {getStatusText(status)} ({status === 'all' ? issues.length : issues.filter(i => i.status === status).length})
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
            pinColor={getMarkerColor(issue)}
            onPress={() => setSelectedIssue(issue)}
          >
            <View style={[styles.customMarker, {backgroundColor: getMarkerColor(issue)}]}>
              <Text style={styles.markerText}>{getCategoryIcon(issue.category)}</Text>
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
                    <View style={[styles.badge, {backgroundColor: CATEGORY_COLORS[selectedIssue.category as keyof typeof CATEGORY_COLORS]}]}>
                      <Text style={styles.badgeText}>{getCategoryIcon(selectedIssue.category)} {selectedIssue.category}</Text>
                    </View>
                    <View style={[styles.badge, {backgroundColor: PRIORITY_COLORS[selectedIssue.priority as keyof typeof PRIORITY_COLORS]}]}>
                      <Text style={styles.badgeText}>{selectedIssue.priority}</Text>
                    </View>
                    <View style={[styles.badge, {backgroundColor: STATUS_COLORS[selectedIssue.status]}]}>
                      <Text style={styles.badgeText}>{getStatusText(selectedIssue.status)}</Text>
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
                    <Text style={styles.actionButtonText}>👍 Upvote</Text>
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
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
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
    borderWidth: 2,
    borderColor: COLORS.white,
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
    ...TYPOGRAPHY.h2,
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