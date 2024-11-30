import { LightningElement, track, wire } from 'lwc';
import getStagingRecords from '@salesforce/apex/StagingController.getStagingRecords';
import createContactsFromRecords from '@salesforce/apex/ContactHandler.createContactsFromRecords';
import deleteRecords from '@salesforce/apex/ContactHandler.deleteRecords'; // Import the Apex method
import updateStagingRecords from '@salesforce/apex/ContactHandler.updateStagingRecords'; // Import the Apex method to update records
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class StagingRecordViewer extends NavigationMixin(LightningElement) {
    @track stagingRecords; // All fetched staging records
    @track filteredStagingRecords; // Filtered staging records based on status
    @track selectedRows = []; // Holds selected row IDs
    @track statusOptions = []; // Options for the status filter combobox
    @track selectedStatus = ''; // Currently selected status for filtering

    // Define columns for the datatable
    columns = [
        { 
            label: 'Name', 
            fieldName: 'nameLink', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'FullName' }, target: '_blank' } 
        },
        { label: 'Email', fieldName: 'Email__c', type: 'email' },
        { label: 'Secondary Email', fieldName: 'Secondary_Email__c', type: 'email' },
        { label: 'Other Email', fieldName: 'Other_Email__c', type: 'email' },
        { label: 'Umail', fieldName: 'umail__c', type: 'email' },
        { label: 'Phone', fieldName: 'Phone__c', type: 'phone' },
        { label: 'BirthDate', fieldName: 'BirthDate__c', type: 'date-local' }, 
        { label: 'Status', fieldName: 'stagingStatus__c', type: 'text' }
    ];

    // Wire Apex method to property to fetch data
    @wire(getStagingRecords)
    wiredStagingRecords({ error, data }) {
        if (data) {
            this.stagingRecords = data.map(record => {
                return {                   
                    ...record,                    
                    FullName: `${record.FirstName__c} ${record.LastName__c}`, // Combine First and Last Name
                    BirthDate__c: record.BirthDate__c ? new Date(record.BirthDate__c).toISOString().slice(0, 10) : '',
                    nameLink: `/lightning/r/Custom_Object__c/${record.Id}/view` // Record ID link through the name                    
                };
            });
            this.filteredStagingRecords = [...this.stagingRecords]; // Initialize with all records
            this.setStatusOptions(); // Set the status filter options
        } else if (error) {
            console.error('Error fetching staging records:', error); // Log the error if there's an issue
        }
    }

    // Set status filter options dynamically
    setStatusOptions() {
        const uniqueStatuses = [...new Set(this.stagingRecords.map(record => record.stagingStatus__c))];
        this.statusOptions = uniqueStatuses.map(status => ({
            label: status,
            value: status
        }));
        this.statusOptions.unshift({ label: 'All', value: '' }); // Add 'All' option to reset filter
    }

    // Handle status change from the combobox
    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
        this.filterRecordsByStatus();
    }

    // Filter records based on selected status
    filterRecordsByStatus() {
        if (this.selectedStatus) {
            this.filteredStagingRecords = this.stagingRecords.filter(record => record.stagingStatus__c === this.selectedStatus);
        } else {
            this.filteredStagingRecords = [...this.stagingRecords]; // Show all records if 'All' is selected
        }
    }

    // Handle row selection in datatable
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows.map(row => row.Id); // Update selected rows by extracting Ids
    }

    // Handle the creation of contacts from selected rows
    handleCreateContact() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record.', 'error');
            return;
        }

        // Get the full record data for selected rows
        const selectedRecords = this.stagingRecords.filter(record => 
            this.selectedRows.includes(record.Id)
        );

        // Check for any records that are already processed
        const processedRecords = selectedRecords.filter(record => record.stagingStatus__c === 'Processed');
        if (processedRecords.length > 0) {
            this.showToast('Warning', 'Some records are already processed and cannot be inserted again.', 'warning');
            return; // Prevent further execution if there are processed records
        }

        createContactsFromRecords({ records: selectedRecords })
            .then(() => {
                this.showToast('Success', 'Contacts created and staging records updated to "Processed".', 'success');
                window.location.reload(); // Refresh the page after action
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while creating contacts: ' + error.body.message, 'error');
            });
    }

    // Handle deletion of selected records
    handleDeleteRecords() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record to delete.', 'error');
            return;
        }

        // Confirm deletion
        if (confirm('Are you sure you want to delete the selected records? This action cannot be undone.')) {
            deleteRecords({ recordIds: this.selectedRows })
                .then(() => {
                    this.showToast('Success', 'Selected records have been deleted.', 'success');
                    window.location.reload(); // Refresh the page after action
                })
                .catch(error => {
                    this.showToast('Error', 'An error occurred while deleting records: ' + error.body.message, 'error');
                });
        }
    }

    // Handle Deny and Hold to set status to Rejected
    handleDenyAndHold() {
        if (this.selectedRows.length === 0) {
            this.showToast('Error', 'Please select at least one record to deny and hold.', 'error');
            return;
        }

        updateStagingRecords({ recordIds: this.selectedRows, newStatus: 'Rejected' })
            .then(() => {
                this.showToast('Success', 'Selected records have been set to "Rejected".', 'success');
                window.location.reload(); // Refresh the page after action
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while updating records: ' + error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
