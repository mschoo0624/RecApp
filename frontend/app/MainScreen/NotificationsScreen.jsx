import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../lib/firebaseConfig';

// Getting the backend endpoints API. 
const backendAPI = "http://localhost:8000"; 

export default function NotificationsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pending friend requests from backend
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      // Getting the current users data and fetching all the pending friend requests. 
      const token = await currentUser.getIdToken();
      const res = await fetch(`${backendAPI}/friend-requests/pending/${currentUser.uid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingRequests();
  };

    const renderRequest = ({ item }) => (
        <View style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
            <Ionicons name="person-add" size={24} color="#3B82F6" />
            </View>
            <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Friend Request</Text>
            <Text style={styles.notificationMessage}>
                From: {item.from_user_name || item.from_user}
            </Text>
            <Text style={styles.notificationTime}>
                {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
            </Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={async () => {
                    try {
                    // To Accecpt the the pending friend requests. 
                    const token = await auth.currentUser.getIdToken();
                    const res = await fetch(`${backendAPI}/friend-requests/respond`, {
                        method: "POST",
                        headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                        request_id: item.id,
                        response: "accept",
                        }),
                    });
                    if (!res.ok) throw new Error("Failed to accept request");
                    // Remove the request from the list
                    setRequests((prev) => prev.filter((r) => r.id !== item.id));
                    } catch (err) {
                    alert("Error accepting request");
                    }
                }}
                >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={async () => {
                    try {
                    // To reject the the pending friend requests. 
                    const token = await auth.currentUser.getIdToken();
                    const res = await fetch(`${backendAPI}/friend-requests/respond`, {
                        method: "POST",
                        headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                        request_id: item.id,
                        response: "reject",
                        }),
                    });
                    if (!res.ok) throw new Error("Failed to reject request");
                    setRequests((prev) => prev.filter((r) => r.id !== item.id));
                    } catch (err) {
                    alert("Error rejecting request");
                    }
                }}
                >
                <Ionicons name="close" size={18} color="white" />
                <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
    );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friend Requests</Text>
      </View>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No pending friend requests</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  notificationIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
    actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
    acceptButton: {
    backgroundColor: '#22c55e',
  },
    rejectButton: {
    backgroundColor: '#ef4444',
  },
    buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});