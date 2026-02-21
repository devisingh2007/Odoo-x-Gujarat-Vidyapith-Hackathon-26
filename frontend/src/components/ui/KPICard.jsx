import './KPICard.css';

export default function KPICard({ icon: Icon, label, value, trend, trendUp, color = 'blue' }) {
    return (
        <div className={`kpi-card kpi-${color}`}>
            <div className="kpi-icon-wrap">
                <Icon size={24} />
            </div>
            <div className="kpi-info">
                <span className="kpi-value">{value}</span>
                <span className="kpi-label">{label}</span>
            </div>
            {trend !== undefined && (
                <div className={`kpi-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </div>
            )}
        </div>
    );
}
