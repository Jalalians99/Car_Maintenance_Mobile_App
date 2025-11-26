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
import { Car, MaintenanceRecord, Notification, SearchFilters, MaintenanceFilters, Reminder } from '../types';

export class DatabaseService {
  static async addCar(carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
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

  static async updateCar(carId: string, updates: Partial<Car>): Promise<void> {
    try {
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

  static async deleteCar(carId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'cars', carId));
    } catch (error: any) {
      throw new Error(`Failed to delete car: ${error.message || 'Unknown error'}`);
    }
  }

  static async searchCars(userId: string, filters: SearchFilters): Promise<Car[]> {
    try {
      let q = query(
        collection(firestore, 'cars'),
        where('ownerId', '==', userId)
      );

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

  static async addMaintenanceRecord(maintenanceData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
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

  static async updateMaintenanceRecord(recordId: string, updates: Partial<MaintenanceRecord>): Promise<void> {
    try {
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

  static async deleteMaintenanceRecord(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'maintenance', recordId));
    } catch (error: any) {
      throw new Error(`Failed to delete maintenance record: ${error.message || 'Unknown error'}`);
    }
  }


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

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'notifications', notificationId));
    } catch (error) {
      throw new Error('Failed to delete notification');
    }
  }

  static async getDashboardStats(userId: string): Promise<{
    totalCars: number;
    totalMaintenanceRecords: number;
    totalMaintenanceCost: number;
    upcomingMaintenance: number;
  }> {
    try {
      let cars: Car[] = [];
      let maintenance: MaintenanceRecord[] = [];

      try {
        cars = await this.getUserCars(userId);
      } catch (error) {
        // Silently handle error
      }

      try {
        maintenance = await this.getUserMaintenanceRecords(userId);
      } catch (error) {
        // Silently handle error
      }

      const totalMaintenanceCost = maintenance.reduce((sum, record) => sum + (record.cost || 0), 0);

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
        totalMaintenanceCost,
        upcomingMaintenance,
      };
    } catch (error: any) {
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

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


  static async addReminder(reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
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

  static async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    try {
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

  static async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminderRef = doc(firestore, 'reminders', reminderId);
      await deleteDoc(reminderRef);
    } catch (error: any) {
      throw new Error('Failed to delete reminder');
    }
  }

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
