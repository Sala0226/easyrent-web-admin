import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ArrowLeftIcon, PowerIcon } from '../components/icons';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/properties/${id}`);
      setProperty(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des détails de la propriété.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id, token]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status: newStatus });
      fetchPropertyDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const getStatusBadge = (status) => {
    const isPending = status === 'EN_ATTENTE' || status === 'PENDING';
    const isValidated = status === 'VALIDEE' || status === 'VALIDATED';
    const isSuspended = status === 'SUSPENDUE' || status === 'SUSPENDED';

    let label = 'EN_ATTENTE';
    let bgColor = '#fef3c7';
    let color = '#92400e';

    if (isValidated) {
      label = 'VALIDÉE';
      bgColor = '#d1fae5';
      color = '#065f46';
    } else if (isSuspended) {
      label = 'SUSPENDUE';
      bgColor = '#fee2e2';
      color = '#991b1b';
    } else if (status === 'REFUSEE' || status === 'REFUSED') {
      label = 'REFUSÉE';
      bgColor = '#fee2e2';
      color = '#991b1b';
    }

    return (
      <span style={{ ...styles.statusBadge, backgroundColor: bgColor, color: color }}>
        {label}
      </span>
    );
  };

  if (loading) return <div style={styles.centerText}>Chargement des détails...</div>;
  if (error) return <div style={styles.errorAlert}>{error}</div>;
  if (!property) return <div style={styles.centerText}>Propriété introuvable.</div>;

  const isSuspended = property.status === 'SUSPENDUE' || property.status === 'SUSPENDED';

  // Extraction robuste des images depuis différentes structures possibles
  const extractImageUrl = (img) => {
    if (typeof img === 'string') return img;
    if (img && img.url) return img.url;
    if (img && img.imageUrl) return img.imageUrl;
    return null;
  };

  const getAllImages = () => {
    const images = [];

    // Cas 1: property.images est un tableau d'objets avec url
    if (Array.isArray(property.images)) {
      property.images.forEach(img => {
        const url = extractImageUrl(img);
        if (url) images.push(url);
      });
    }

    // Cas 2: property.photos est un tableau d'objets avec url
    if (Array.isArray(property.photos)) {
      property.photos.forEach(photo => {
        const url = extractImageUrl(photo);
        if (url && !images.includes(url)) images.push(url);
      });
    }

    // Cas 3: property.image ou property.imageUrl est une string unique
    if (property.image && typeof property.image === 'string' && !images.includes(property.image)) {
      images.push(property.image);
    }
    if (property.imageUrl && typeof property.imageUrl === 'string' && !images.includes(property.imageUrl)) {
      images.push(property.imageUrl);
    }

    return images;
  };

  const allImages = getAllImages();
  const mainImage = allImages.length > 0 ? allImages[0] : null;
  const secondaryImages = allImages.length > 1 ? allImages.slice(1) : [];

  return (
    <div style={styles.container}>
      {/* En-tête avec bouton retour et bouton de suspension */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeftIcon size={16} /> Retour
        </button>

        <button 
          onClick={() => handleUpdateStatus(isSuspended ? 'VALIDEE' : 'SUSPENDUE')} 
          style={isSuspended ? styles.activateBtn : styles.suspendBtn}
        >
          <PowerIcon size={16} /> {isSuspended ? 'Activer la propriété' : 'Suspendre la propriété'}
        </button>
      </div>

      {/* Titre & Statut */}
      <div style={styles.headerCard}>
        <div>
          <span style={styles.typeBadge}>{property.type}</span>
          <h1 style={styles.title}>{property.title}</h1>
          <p style={styles.location}>{property.address}, {property.city}</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.price}>
            {property.price ? `${property.price.toLocaleString()} FCFA` : 'N/C'}
          </span>
          {getStatusBadge(property.status)}
        </div>
      </div>

      {/* Informations générales & Description */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Informations générales</h3>
        <div style={styles.specsGrid}>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Type</span>
            <strong style={styles.specValue}>{property.type || 'N/A'}</strong>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Prix</span>
            <strong style={styles.specValue}>
              {property.price ? `${property.price.toLocaleString()} FCFA` : 'N/A'}
            </strong>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Surface</span>
            <strong style={styles.specValue}>
              {property.surface ? `${property.surface} m²` : 'N/A'}
            </strong>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Chambres</span>
            <strong style={styles.specValue}>{property.rooms || property.chambres || 'N/A'}</strong>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Salles de bain</span>
            <strong style={styles.specValue}>{property.bathrooms || property.sallesDeBain || 'N/A'}</strong>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Favoris</span>
            <strong style={styles.specValue}>
              ⭐ {property._count?.favorites || property.favorites?.length || 0}
            </strong>
          </div>
        </div>

        <h3 style={{ ...styles.cardTitle, marginTop: '25px' }}>Description</h3>
        <p style={styles.description}>
          {property.description || 'Aucune description disponible pour ce bien.'}
        </p>

        {/* Section Images de la propriété */}
        <h3 style={{ ...styles.cardTitle, marginTop: '30px' }}>Images de la propriété</h3>
        <div style={styles.imagesContainer}>
          {/* Image principale */}
          <div style={styles.mainImageWrapper}>
            {mainImage ? (
              <img src={mainImage} alt="Bien principal" style={styles.imageCover} />
            ) : (
              <div style={styles.noImagePlaceholder}>Aucune image principale</div>
            )}
            <span style={styles.imageCaption}>Image principale</span>
          </div>

          {/* Photos secondaires */}
          <div style={styles.secondaryImagesGrid}>
            {secondaryImages.length > 0 ? (
              secondaryImages.map((imgUrl, index) => (
                <div key={index} style={styles.secondaryImageWrapper}>
                  <img src={imgUrl} alt={`Photo ${index + 1}`} style={styles.imageCover} />
                </div>
              ))
            ) : (
              <div style={styles.noSecondaryImages}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Aucune photo secondaire</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '40px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    color: '#334155',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  suspendBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
  },
  activateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  typeBadge: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    margin: '8px 0 4px 0',
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
  },
  location: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  price: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
  },
  specItem: {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  specLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
  },
  specValue: {
    fontSize: '15px',
    color: '#0f172a',
  },
  description: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    margin: 0,
  },
  imagesContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '20px',
    marginTop: '15px',
  },
  mainImageWrapper: {
    position: 'relative',
    height: '260px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  secondaryImagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    height: '260px',
  },
  secondaryImageWrapper: {
    height: '124px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  imageCover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageCaption: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  noImagePlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '13px',
  },
  noSecondaryImages: {
    gridColumn: 'span 2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
  },
  centerText: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fee2e2',
  },
};