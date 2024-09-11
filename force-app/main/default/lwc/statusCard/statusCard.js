import { LightningElement, track, wire } from 'lwc';
import getStatusCounts from '@salesforce/apex/StagingStatusController.getStatusCounts';

export default class StatusCard extends LightningElement {
    @track statusData = []; // Array to hold status data for display

    // Wire Apex method to fetch status counts
    @wire(getStatusCounts)
    wiredStatusCounts({ error, data }) {
        if (data) {
            // Transform the returned data into an array format that can be used in the template
            this.statusData = Object.keys(data).map(key => ({
                label: key,
                count: data[key] || 0 // Ensure we handle any potential undefined values
            }));
        } else if (error) {
            // Log any error that occurs while fetching data
            console.error('Error fetching status counts:', error);
        }
    }
}
