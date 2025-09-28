import { db } from '../../../config/firebase';

/**
 * Helper function to resolve lab names from lab IDs
 * @param labIds Array of lab IDs to resolve
 * @returns Map of lab ID to lab name
 */
export const resolveLabNames = async (labIds: string[]): Promise<Map<string, string>> => {
  const labNamesMap = new Map<string, string>();
  
  // Remove duplicates and filter out empty IDs
  const uniqueLabIds = [...new Set(labIds)].filter(id => id && id.trim() !== '');
  
  for (const labId of uniqueLabIds) {
    try {
      const labDoc = await db.collection('labs').doc(labId).get();
      if (labDoc.exists) {
        const labData = labDoc.data();
        labNamesMap.set(labId, labData?.name || 'Unknown Lab');
      } else {
        labNamesMap.set(labId, 'Unknown Lab');
      }
    } catch (error) {
      console.error(`Error fetching lab ${labId}:`, error);
      labNamesMap.set(labId, 'Unknown Lab');
    }
  }
  
  return labNamesMap;
};

/**
 * Helper function to add lab names to lab orders
 * @param labOrders Array of lab orders with labId field
 * @returns Array of lab orders with labName field added
 */
export const addLabNamesToOrders = async <T extends { labId: string }>(
  labOrders: T[]
): Promise<(T & { labName: string })[]> => {
  // Extract all unique lab IDs
  const labIds = labOrders.map(order => order.labId);
  
  // Resolve lab names
  const labNamesMap = await resolveLabNames(labIds);
  
  // Add lab names to each order
  return labOrders.map(order => ({
    ...order,
    labName: labNamesMap.get(order.labId) || 'Unknown Lab'
  }));
};
