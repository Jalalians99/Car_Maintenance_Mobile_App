import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Car, MaintenanceRecord, OilChangeRecord, Notification, SearchFilters, MaintenanceFilters, Reminder } from '../types';

export class DatabaseService {
  // === CAR OPERATIONS ===
  
  // Add new car
  static async addCar(carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Filter out undefined values for Firestore
      const cleanedData: any = {};
      Object.entries(carData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedData[key] = value;
        }
      });
      
      const docRef = await addDoc(collection(firestore, 'cars'), {
        ...cleanedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add car: ${error.message || 'Unknown error'}`);
    }
  }

  // Get user's cars
  static async getUserCars(userId: string): Promise<Car[]> {
    try {
      const q = query(
        collection(firestore, 'cars'),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const cars: Car[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cars.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Car);
      });
      
      return cars;
    } catch (error: any) {
      throw new Error('Failed to fetch cars');
    }
  }

  // Get single car
  static async getCar(carId: string): Promise<Car | null> {
    try {
      const docRef = doc(firestore, 'cars', carId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Car;
    } catch (error) {
      throw new Error('Failed to fetch car');
    }
  }

  // Update car
  static async updateCar(carId: string, updates: Partial<Car>): Promise<void> {
    try {
      // Filter out undefined values
      const cleanedUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedUpdates[key] = value;
        }
      });
      
      const carRef = doc(firestore, 'cars', carId);
      await updateDoc(carRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update car: ${error.message || 'Unknown error'}`);
    }
  }

  // Delete car
  static async deleteCar(carId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'cars', carId));
    } catch (error: any) {
      throw new Error(`Failed to delete car: ${error.message || 'Unknown error'}`);
    }
  }

  // Search cars
  static async searchCars(userId: string, filters: SearchFilters): Promise<Car[]> {
    try {
      let q = query(
        collection(firestore, 'cars'),
        where('ownerId', '==', userId)
      );

      // Apply filters
      if (filters.make) {
        q = query(q, where('make', '==', filters.make));
      }
      if (filters.model) {
        q = query(q, where('model', '==', filters.model));
      }
      if (filters.year) {
        q = query(q, where('year', '==', filters.year));
      }
      if (filters.subType) {
        q = query(q, where('subType', '==', filters.subType));
      }

      const querySnapshot = await getDocs(q);
      const cars: Car[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Additional filtering for ranges
        if (filters.minYear && data.year < filters.minYear) return;
        if (filters.maxYear && data.year > filters.maxYear) return;
        
        cars.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Car);
      });
      
      return cars;
    } catch (error) {
      throw new Error('Failed to search cars');
    }
  }

  // === MAINTENANCE OPERATIONS ===
  
  // Add maintenance record
  static async addMaintenanceRecord(maintenanceData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Filter out undefined values for Firestore
      const cleanedData: any = {};
      Object.entries(maintenanceData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedData[key] = value;
        }
      });
      
      const docRef = await addDoc(collection(firestore, 'maintenance'), {
        ...cleanedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add maintenance record: ${error.message || 'Unknown error'}`);
    }
  }

  // Get car's maintenance records
  static async getCarMaintenanceRecords(carId: string): Promise<MaintenanceRecord[]> {
    try {
      const q = query(
        collection(firestore, 'maintenance'),
        where('carId', '==', carId),
        orderBy('maintenanceDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: MaintenanceRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as MaintenanceRecord);
      });
      
      return records;
    } catch (error) {
      throw new Error('Failed to fetch maintenance records');
    }
  }

  // Get single maintenance record
  static async getMaintenanceRecord(recordId: string): Promise<MaintenanceRecord | null> {
    try {
      const docRef = doc(firestore, 'maintenance', recordId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as MaintenanceRecord;
    } catch (error) {
      throw new Error('Failed to fetch maintenance record');
    }
  }

  // Update maintenance record
  static async updateMaintenanceRecord(recordId: string, updates: Partial<MaintenanceRecord>): Promise<void> {
    try {
      // Filter out undefined values
      const cleanedUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedUpdates[key] = value;
        }
      });
      
      const recordRef = doc(firestore, 'maintenance', recordId);
      await updateDoc(recordRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update maintenance record: ${error.message || 'Unknown error'}`);
    }
  }

  // Delete maintenance record
  static async deleteMaintenanceRecord(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'maintenance', recordId));
    } catch (error: any) {
      throw new Error(`Failed to delete maintenance record: ${error.message || 'Unknown error'}`);
    }
  }

  // === OIL CHANGE OPERATIONS ===
  
  // Add oil change record
  static async addOilChangeRecord(oilChangeData: Omit<OilChangeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'oilChanges'), {
        ...oilChangeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to add oil change record');
    }
  }

  // Get car's oil change records
  static async getCarOilChangeRecords(carId: string): Promise<OilChangeRecord[]> {
    try {
      const q = query(
        collection(firestore, 'oilChanges'),
        where('carId', '==', carId),
        orderBy('changeDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: OilChangeRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as OilChangeRecord);
      });
      
      return records;
    } catch (error) {
      throw new Error('Failed to fetch oil change records');
    }
  }

  // Update oil change record
  static async updateOilChangeRecord(recordId: string, updates: Partial<OilChangeRecord>): Promise<void> {
    try {
      const recordRef = doc(firestore, 'oilChanges', recordId);
      await updateDoc(recordRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error('Failed to update oil change record');
    }
  }

  // Delete oil change record
  static async deleteOilChangeRecord(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'oilChanges', recordId));
    } catch (error) {
      throw new Error('Failed to delete oil change record');
    }
  }

  // === NOTIFICATION OPERATIONS ===
  
  // Add notification
  static async addNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to add notification');
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(firestore, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Notification);
      });
      
      return notifications;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'notifications', notificationId));
    } catch (error) {
      throw new Error('Failed to delete notification');
    }
  }

  // === ANALYTICS AND STATISTICS ===
  
  // Get dashboard statistics
  static async getDashboardStats(userId: string): Promise<{
    totalCars: number;
    totalMaintenanceRecords: number;
    totalOilChanges: number;
    totalMaintenanceCost: number;
    upcomingMaintenance: number;
  }> {
    try {
      // Fetch data with individual error handling
      let cars: Car[] = [];
      let maintenance: MaintenanceRecord[] = [];
      let oilChanges: OilChangeRecord[] = [];

      try {
        cars = await this.getUserCars(userId);
      } catch (error) {
        // Continue with empty array
      }

      try {
        maintenance = await this.getUserMaintenanceRecords(userId);
      } catch (error) {
        // Continue with empty array
      }

      try {
        oilChanges = await this.getUserOilChangeRecords(userId);
      } catch (error) {
        // Continue with empty array
      }

      const totalMaintenanceCost = maintenance.reduce((sum, record) => sum + (record.cost || 0), 0) +
                                 oilChanges.reduce((sum, record) => sum + (record.cost || 0), 0);

      const now = new Date();
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcomingMaintenance = maintenance.filter(record => {
        if (!record.nextDueDate) return false;
        const dueDate = new Date(record.nextDueDate);
        return dueDate <= oneMonthFromNow && dueDate >= now;
      }).length;

      return {
        totalCars: cars.length,
        totalMaintenanceRecords: maintenance.length,
        totalOilChanges: oilChanges.length,
        totalMaintenanceCost,
        upcomingMaintenance,
      };
    } catch (error: any) {
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  // Get all user maintenance records
  private static async getUserMaintenanceRecords(userId: string): Promise<MaintenanceRecord[]> {
    try {
      const cars = await this.getUserCars(userId);
      const carIds = cars.map(car => car.id);
      
      if (carIds.length === 0) {
        return [];
      }

      const q = query(
        collection(firestore, 'maintenance'),
        where('carId', 'in', carIds),
        orderBy('maintenanceDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: MaintenanceRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as MaintenanceRecord);
      });
      
      return records;
    } catch (error: any) {
      throw error;
    }
  }

  // Get all user oil change records
  private static async getUserOilChangeRecords(userId: string): Promise<OilChangeRecord[]> {
    try {
      const cars = await this.getUserCars(userId);
      const carIds = cars.map(car => car.id);
      
      if (carIds.length === 0) {
        return [];
      }

      const q = query(
        collection(firestore, 'oilChanges'),
        where('carId', 'in', carIds),
        orderBy('changeDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: OilChangeRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as OilChangeRecord);
      });
      
      return records;
    } catch (error: any) {
      throw error;
    }
  }

  // === REMINDER OPERATIONS ===

  // Add new reminder
  static async addReminder(reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Filter out undefined values
      const cleanedData: any = {};
      Object.entries(reminderData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedData[key] = value;
        }
      });
      
      const docRef = await addDoc(collection(firestore, 'reminders'), {
        ...cleanedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add reminder: ${error.message || 'Unknown error'}`);
    }
  }

  // Get user's reminders
  static async getUserReminders(userId: string): Promise<Reminder[]> {
    try {
      const q = query(
        collection(firestore, 'reminders'),
        where('userId', '==', userId),
        orderBy('reminderDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const reminders: Reminder[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reminders.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Reminder);
      });
      
      return reminders;
    } catch (error: any) {
      throw new Error('Failed to fetch reminders');
    }
  }

  // Get single reminder
  static async getReminder(reminderId: string): Promise<Reminder | null> {
    try {
      const docRef = doc(firestore, 'reminders', reminderId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Reminder;
    } catch (error) {
      throw new Error('Failed to fetch reminder');
    }
  }

  // Update reminder
  static async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    try {
      // Filter out undefined values
      const cleanedUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedUpdates[key] = value;
        }
      });
      
      const reminderRef = doc(firestore, 'reminders', reminderId);
      await updateDoc(reminderRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update reminder: ${error.message || 'Unknown error'}`);
    }
  }

  // Delete reminder
  static async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminderRef = doc(firestore, 'reminders', reminderId);
      await deleteDoc(reminderRef);
    } catch (error: any) {
      throw new Error('Failed to delete reminder');
    }
  }

  // Get reminders for a specific car
  static async getCarReminders(carId: string): Promise<Reminder[]> {
    try {
      const q = query(
        collection(firestore, 'reminders'),
        where('carId', '==', carId),
        where('status', '==', 'pending'),
        orderBy('reminderDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const reminders: Reminder[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reminders.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Reminder);
      });
      
      return reminders;
    } catch (error: any) {
      throw new Error('Failed to fetch car reminders');
    }
  }

  // Get pending reminders (for notifications)
  static async getPendingReminders(userId: string): Promise<Reminder[]> {
    try {
      const q = query(
        collection(firestore, 'reminders'),
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('reminderDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const reminders: Reminder[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reminders.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Reminder);
      });
      
      return reminders;
    } catch (error: any) {
      throw new Error('Failed to fetch pending reminders');
    }
  }
}
