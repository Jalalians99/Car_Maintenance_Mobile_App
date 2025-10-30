import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Export all user data to JSON file
 * This creates a backup that can be saved/shared
 */
export const exportAllData = async (userId: string): Promise<void> => {
  try {
    // Fetch all collections
    const carsSnapshot = await getDocs(collection(firestore, 'cars'));
    const maintenanceSnapshot = await getDocs(collection(firestore, 'maintenance'));
    const remindersSnapshot = await getDocs(collection(firestore, 'reminders'));

    // Filter by user ownership
    const cars = carsSnapshot.docs
      .filter(doc => doc.data().ownerId === userId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const maintenance = maintenanceSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    const reminders = remindersSnapshot.docs
      .filter(doc => doc.data().userId === userId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    // Create export object
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      version: '1.0',
      data: {
        cars,
        maintenance,
        reminders,
      },
      stats: {
        totalCars: cars.length,
        totalMaintenance: maintenance.length,
        totalReminders: reminders.length,
      },
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `car-workshop-backup-${timestamp}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write to file
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save Car Workshop Backup',
        UTI: 'public.json',
      });
    }
  } catch (error) {
    throw new Error('Failed to export data');
  }
};

/**
 * Get export data as string (for copying to clipboard)
 */
export const getExportDataString = async (userId: string): Promise<string> => {
  try {
    const carsSnapshot = await getDocs(collection(firestore, 'cars'));
    const maintenanceSnapshot = await getDocs(collection(firestore, 'maintenance'));
    const remindersSnapshot = await getDocs(collection(firestore, 'reminders'));

    const cars = carsSnapshot.docs
      .filter(doc => doc.data().ownerId === userId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const maintenance = maintenanceSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    const reminders = remindersSnapshot.docs
      .filter(doc => doc.data().userId === userId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      version: '1.0',
      data: { cars, maintenance, reminders },
      stats: {
        totalCars: cars.length,
        totalMaintenance: maintenance.length,
        totalReminders: reminders.length,
      },
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    throw new Error('Failed to get export data');
  }
};

