function normaliseVendor(vendor) {
  if (!vendor) return null
  return vendor.replace(/,?\s*(Inc\.?|LLC\.?|Ltd\.?|Corp\.?|Co\.?)$/i, '').trim()
}

export default function VendorBadge({ vendor, hostname }) {
  const isUnidentified = !hostname && !vendor
  if (isUnidentified) {
    return <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>UNIDENTIFIED</span>
  }
  const label = normaliseVendor(vendor) || 'Unknown Vendor'
  return <span className="badge badge-neutral">{label}</span>
}
