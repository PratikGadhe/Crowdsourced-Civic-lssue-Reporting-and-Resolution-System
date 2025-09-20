import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types/navigation';
import { COLORS } from '../utils/constants';

// Import screens (we'll create these next)
import HomeScreen from '../screens/main/HomeScreen';
import ReportIssueScreen from '../screens/main/ReportIssueScreenAI';
import MyReportsScreen from '../screens/main/MyReportsScreen';

import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          // tabBarIcon: ({color, size}) => <Icon name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report',
          // tabBarIcon: ({color, size}) => <Icon name="plus-circle" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{
          tabBarLabel: 'My Reports',
          // tabBarIcon: ({color, size}) => <Icon name="list" size={size} color={color} />
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          // tabBarIcon: ({color, size}) => <Icon name="user" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;