import './StatusPill.css';

const statusColors = {
    'Available': 'status-available',
    'On Trip': 'status-on-trip',
    'In Shop': 'status-in-shop',
    'Retired': 'status-retired',
    'On Duty': 'status-available',
    'Off Duty': 'status-off-duty',
    'Suspended': 'status-suspended',
    'Draft': 'status-draft',
    'Dispatched': 'status-on-trip',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled',
    'In Progress': 'status-on-trip',
};

export default function StatusPill({ status }) {
    return (
        <span className={`status-pill ${statusColors[status] || 'status-default'}`}>
            {status}
        </span>
    );
}
