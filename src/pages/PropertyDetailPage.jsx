import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiArrowLeft, FiPower, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const PUBLISHER_TYPE_LABELS = {
  individual: 'Particulier',
  agency: 'Agence immobilière',
  promoter: 'Promoteur immobilier',
  residence: 'Résidence meublée',
};

const formatPublisherType = (value) => {
  if (!value) return null;
  return PUBLISHER_TYPE_LABELS[value] || value;
};

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
    let bgColor = 'bg-amber-50';
    let textColor = 'text-amber-700';

    if (isValidated) {
      label = 'VALIDÉE';
      bgColor = 'bg-emerald-50';
      textColor = 'text-emerald-700';
    } else if (isSuspended) {
      label = 'SUSPENDUE';
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
    } else if (status === 'REFUSEE' || status === 'REFUSED') {
      label = 'REFUSÉE';
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${bgColor} ${textColor}`}>
        {label}
      </span>
    );
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Chargement des détails...</div>;
  if (error) return <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-5 border border-red-200">{error}</div>;
  if (!property) return <div className="text-center py-10 text-slate-500">Propriété introuvable.</div>;

  const isSuspended = property.status === 'SUSPENDUE' || property.status === 'SUSPENDED';

  // En réactivant, on restaure le statut mémorisé avant la suspension.
  const nextStatus = isSuspended ? property.previousStatus || 'VALIDEE' : 'SUSPENDUE';

  // Informations sur l'annonceur (propriétaire de l'annonce)
  const owner = property.owner || {};
  const ownerInitial = owner.name?.trim()?.charAt(0)?.toUpperCase() || 'A';
  const ownerMemberSince = owner.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const publisherTypeLabel = formatPublisherType(owner.publisherType);

  // Extraction robuste des images depuis différentes structures possibles
  const extractImageUrl = (img) => {
    if (typeof img === 'string') return img;
    if (img && img.url) return img.url;
    if (img && img.imageUrl) return img.imageUrl;
    return null;
  };

  const getAllImages = () => {
    const images = [];

    if (Array.isArray(property.images)) {
      property.images.forEach(img => {
        const url = extractImageUrl(img);
        if (url) images.push(url);
      });
    }

    if (Array.isArray(property.photos)) {
      property.photos.forEach(photo => {
        const url = extractImageUrl(photo);
        if (url && !images.includes(url)) images.push(url);
      });
    }

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
    <div className="max-w-7xl mx-auto pb-10">
      {/* En-tête avec bouton retour et bouton de suspension */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FiArrowLeft size={16} /> Retour
        </button>

        <button
          onClick={() => handleUpdateStatus(nextStatus)}
          className={`inline-flex items-center justify-center gap-2 min-w-[20px] px-5 py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer ${
            isSuspended
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600 transition-colors'
              : 'bg-red-500 text-white shadow-md shadow-red-500/25 hover:bg-red-600 transition-colors'
          }`}
        >
          <FiPower size={16} /> {isSuspended ? 'Réactiver la propriété' : 'Suspendre la propriété'}
        </button>
      </div>

      {/* Titre & Statut */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-start gap-5 mb-5">
        <div className="flex-1">
          <span className="bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full text-xs font-bold uppercase">
            {property.type}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-1">{property.title}</h1>
          <p className="text-sm text-slate-500 m-0">{property.address}, {property.city}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xl font-extrabold text-slate-900">
            {property.price ? `${property.price.toLocaleString()} FCFA` : 'N/C'}
          </span>
          {getStatusBadge(property.status)}
        </div>
      </div>

      {/* Informations sur l'annonceur */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900 m-0">Annonceur</h3>
          {owner.id && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                owner.isActive === false
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {owner.isActive === false ? 'Compte désactivé' : 'Compte actif'}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {ownerInitial}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-base text-slate-900">
                {owner.name || 'Annonceur'}
              </strong>
              {publisherTypeLabel && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                  {publisherTypeLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <a
                href={owner.email ? `mailto:${owner.email}` : undefined}
                className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 no-underline hover:bg-slate-100 transition-colors min-w-0"
              >
                <FiMail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{owner.email || 'Email non renseigné'}</span>
              </a>

              <a
                href={owner.phone ? `tel:${owner.phone}` : undefined}
                className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 no-underline hover:bg-slate-100 transition-colors min-w-0"
              >
                <FiPhone size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{owner.phone || 'Téléphone non renseigné'}</span>
              </a>

              <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 min-w-0">
                <FiMapPin size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{owner.city || 'Ville non renseignée'}</span>
              </div>
            </div>

            {ownerMemberSince && (
              <p className="text-xs text-slate-500 mt-3 mb-0">
                Membre depuis le {ownerMemberSince}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informations générales & Description */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-semibold">Type</span>
            <strong className="text-sm text-slate-900">{property.type || 'N/A'}</strong>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-semibold">Prix</span>
            <strong className="text-sm text-slate-900">
              {property.price ? `${property.price.toLocaleString()} FCFA` : 'N/A'}
            </strong>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-semibold">Surface</span>
            <strong className="text-sm text-slate-900">
              {property.surface ? `${property.surface} m²` : 'N/A'}
            </strong>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-semibold">Chambres</span>
            <strong className="text-sm text-slate-900">{property.rooms || property.chambres || 'N/A'}</strong>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-semibold">Salles de bain</span>
            <strong className="text-sm text-slate-900">{property.bathrooms || property.sallesDeBain || 'N/A'}</strong>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-xs text-slate-500 font-semibold">Favoris</span>
            <strong className="text-sm text-slate-900">
              ⭐ {property._count?.favorites || property.favorites?.length || 0}
            </strong>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-4 mt-6">Description</h3>
        <p className="text-sm text-slate-600 leading-relaxed m-0">
          {property.description || 'Aucune description disponible pour ce bien.'}
        </p>

        {/* Section Images de la propriété */}
        <h3 className="text-lg font-bold text-slate-900 mb-4 mt-8">Images de la propriété</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          {/* Image principale */}
          <div className="relative h-64 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            {mainImage ? (
              <img src={mainImage} alt="Bien principal" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Aucune image principale
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-slate-900/75 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Image principale
            </span>
          </div>

          {/* Photos secondaires */}
          <div className="grid grid-cols-2 gap-3 h-64">
            {secondaryImages.length > 0 ? (
              secondaryImages.map((imgUrl, index) => (
                <div key={index} className="h-[124px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={imgUrl} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-full border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <p className="m-0 text-slate-500 text-xs">Aucune photo secondaire</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}