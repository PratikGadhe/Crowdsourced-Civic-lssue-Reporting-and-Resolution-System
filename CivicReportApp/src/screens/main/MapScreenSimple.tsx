import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
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
  distance?: number;
}

// Mock data for demonstration
const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues and vehicle damage',
    category: 'roads',
    priority: 'high',
    latitude: 37.78825,
    longitude: -122.4324,
    address: 'Main Street, Downtown Area',
    status: 'pending',
    reportedAt: '2024-01-15',
    reportedBy: 'John Doe',
  },
  {
    id: '2',
    title: 'Water Leakage',
    description: 'Broken water pipe flooding the street, urgent repair needed',
    category: 'water',
    priority: 'critical',
    latitude: 37.78925,
    longitude: -122.4334,
    address: 'Oak Avenue, Block 5',
    status: 'in-progress',
    reportedAt: '2024-01-14',
    reportedBy: 'Jane Smith',
  },
  {
    id: '3',
    title: 'Street Light Not Working',
    description: 'Street light has been out for 3 days, safety concern',
    category: 'electricity',
    priority: 'medium',
    latitude: 37.78725,
    longitude: -122.4314,
    address: 'Pine Street, Near Central Park',
    status: 'resolved',
    reportedAt: '2024-01-13',
    reportedBy: 'Mike Johnson',
  },
  {
    id: '4',
    title: 'Overflowing Garbage Bin',
    description: 'Public garbage bin is overflowing, attracting pests',
    category: 'waste',
    priority: 'low',
    latitude: 37.78625,
    longitude: -122.4304,
    address: 'Central Park, East Gate Entrance',
    status: 'pending',
    reportedAt: '2024-01-12',
    reportedBy: 'Sarah Wilson',
  },
  {
    id: '5',
    title: 'Damaged Bus Stop',
    description: 'Bus stop shelter is damaged, glass broken',
    category: 'public',
    priority: 'medium',
    latitude: 37.78525,
    longitude: -122.4294,
    address: 'Market Street, Bus Stop #15',
    status: 'pending',
    reportedAt: '2024-01-11',
    reportedBy: 'David Brown',
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

const PRIORITY_INFO = {
  low: {color: '#4CAF50', label: 'Low Priority'},
  medium: {color: '#FF9800', label: 'Medium Priority'},
  high: {color: '#F44336', label: 'High Priority'},
  critical: {color: '#9C27B0', label: 'Critical'},
};

const STATUS_INFO = {
  pending: {color: '#FF9800', label: 'Pending', icon: '⏳'},
  'in-progress': {color: '#2196F3', label: 'In Progress', icon: '🔧'},
  resolved: {color: '#4CAF50', label: 'Resolved', icon: '✅'},
};

const MapScreen: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'priority' | 'date'>('distance');

  useEffect(() => {
    getCurrentLocationAndLoadIssues();
  }, []);

  const getCurrentLocationAndLoadIssues = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby issues');
        setIssues(MOCK_ISSUES);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Calculate distances and load issues
      const issuesWithDistance = MOCK_ISSUES.map(issue => ({
        ...issue,
        distance: calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          issue.latitude,
          issue.longitude
        ),
      }));

      setIssues(issuesWithDistance);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      setIssues(MOCK_ISSUES);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getFilteredAndSortedIssues = () => {
    let filtered = filter === 'all' ? issues : issues.filter(issue => issue.status === filter);
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'priority':
          const priorityOrder = {critical: 4, high: 3, medium: 2, low: 1};
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'date':
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
        default:
          return 0;
      }
    });
  };

  const renderIssueCard = ({item}: {item: Issue}) => {
    const categoryInfo = CATEGORY_INFO[item.category as keyof typeof CATEGORY_INFO];
    const priorityInfo = PRIORITY_INFO[item.priority as keyof typeof PRIORITY_INFO];
    const statusInfo = STATUS_INFO[item.status];

    return (
      <TouchableOpacity style={styles.issueCard}>
        <View style={styles.issueHeader}>
          <View style={styles.issueTitle}>
            <Text style={styles.categoryIcon}>{categoryInfo?.icon}</Text>
            <Text style={styles.issueTitleText} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Text style={styles.statusText}>{statusInfo.icon}</Text>
          </View>
        </View>

        <Text style={styles.issueDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.issueLocation}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address}
          </Text>
          {item.distance && (
            <Text style={styles.distanceText}>
              {item.distance < 1 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)}km`}
            </Text>
          )}
        </View>

        <View style={styles.issueFooter}>
          <View style={styles.issueInfo}>
            <View style={[styles.priorityBadge, {backgroundColor: priorityInfo.color}]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
            <Text style={styles.reportedBy}>by {item.reportedBy}</Text>
          </View>
          <Text style={styles.reportedDate}>{item.reportedAt}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading nearby issues...</Text>
      </View>
    );
  }

  const filteredIssues = getFilteredAndSortedIssues();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Issues Near You</Text>
        <Text style={styles.headerSubtitle}>
          {userLocation ? 'Showing issues in your area' : 'Showing all issues'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'pending', 'in-progress', 'resolved'].map(status => (
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
                {status === 'all' ? 'All' : STATUS_INFO[status as keyof typeof STATUS_INFO].label} 
                ({status === 'all' ? issues.length : issues.filter(i => i.status === status).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Buttons */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {['distance', 'priority', 'date'].map(sort => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.sortButton,
                sortBy === sort && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(sort as any)}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === sort && styles.sortButtonTextActive,
              ]}>
                {sort === 'distance' ? '📍' : sort === 'priority' ? '⚡' : '📅'} {sort}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Issues List */}
      <FlatList
        data={filteredIssues}
        renderItem={renderIssueCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No issues found</Text>
            <Text style={styles.emptySubtext}>Try changing the filter or check back later</Text>
          </View>
        }
      />

      {/* Stats Footer */}
      <View style={styles.statsFooter}>
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
  controls: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  sortLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  sortButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  sortButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  sortButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sortButtonTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SPACING.md,
  },
  issueCard: {
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
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  issueTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  issueTitleText: {
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
  statusText: {
    fontSize: 14,
  },
  issueDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  issueLocation: {
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
  distanceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  priorityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 10,
  },
  reportedBy: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  reportedDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
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
  statsFooter: {
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