import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Droplets,
  Zap,
  Building,
  Shield,
  Sparkles,
  SquareParking,
  Trees,
  MoreHorizontal,
  Camera,
  X,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Complaint, ComplaintCategory, User } from '../types';

interface RaiseComplaintScreenProps {
  currentUser: User | null;
  onBack: () => void;
  onSubmit: (newComplaint: Omit<Complaint, 'id' | 'customId' | 'reportedAt' | 'timeline'>) => void;
}

interface CategoryOption {
  id: ComplaintCategory;
  nameEn: string;
  nameTa: string;
  icon: React.ReactNode;
}

export const RaiseComplaintScreen: React.FC<RaiseComplaintScreenProps> = ({
  currentUser,
  onBack,
  onSubmit,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('water');
  const [flatLocation, setFlatLocation] = useState(
    currentUser ? `${currentUser.flatNumber}, ${currentUser.block}` : 'B-402, Block B'
  );
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: CategoryOption[] = [
    {
      id: 'water',
      nameEn: 'Water',
      nameTa: 'தண்ணீர்',
      icon: <Droplets className="w-6 h-6" />,
    },
    {
      id: 'power',
      nameEn: 'Power',
      nameTa: 'மின்சாரம்',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      id: 'lift',
      nameEn: 'Lift',
      nameTa: 'லிஃப்ட்',
      icon: <Building className="w-6 h-6" />,
    },
    {
      id: 'security',
      nameEn: 'Security',
      nameTa: 'பாதுகாப்பு',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: 'clean',
      nameEn: 'Clean',
      nameTa: 'சுத்தம்',
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      id: 'parking',
      nameEn: 'Parking',
      nameTa: 'பார்க்கிங்',
      icon: <SquareParking className="w-6 h-6" />,
    },
    {
      id: 'area',
      nameEn: 'Area',
      nameTa: 'பகுதி',
      icon: <Trees className="w-6 h-6" />,
    },
    {
      id: 'other',
      nameEn: 'Other',
      nameTa: 'மற்றவை',
      icon: <MoreHorizontal className="w-6 h-6" />,
    },
  ];

  const demoPhotos = [
    { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Broken Light', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' },
    { label: 'Lift Issue', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the issue.');
      return;
    }
    if (!flatLocation.trim()) {
      setError('Please provide your flat or location.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const selectedCategoryObj = categories.find((c) => c.id === category);

    setTimeout(() => {
      onSubmit({
        category,
        categoryLabel: selectedCategoryObj?.nameEn || 'General',
        categoryLabelTa: selectedCategoryObj?.nameTa || 'பொது',
        title: description.slice(0, 45) + (description.length > 45 ? '...' : ''),
        titleTa: `${selectedCategoryObj?.nameTa || 'புகார்'} - ${flatLocation}`,
        description: description.trim(),
        flatLocation: flatLocation.trim(),
        reportedBy: currentUser?.flatNumber || 'B-402',
        status: 'pending',
        photoUrl: photoUrl || undefined,
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="raise-complaint-view" className="min-h-screen bg-[#F4F7F6] pb-24">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-[#F4F7F6]/95 backdrop-blur-md px-4 py-3.5 flex items-center gap-2 border-b border-slate-200/50">
        <button
          id="raise-back-button"
          onClick={onBack}
          className="p-1 -ml-1 text-[#06424D] hover:bg-slate-200/60 rounded-full transition flex items-center"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          <span className="text-xl font-bold text-[#06424D] -ml-0.5">Raise Complaint</span>
        </button>
      </div>

      <div className="px-5 pt-3 space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-[#06424D] tracking-tight">Raise a Complaint</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">புகாரை பதிவு செய்க</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CATEGORY / வகை */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
              CATEGORY <span className="text-slate-400 font-normal">/ வகை</span>
            </label>

            <div className="grid grid-cols-4 gap-2.5">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`category-btn-${cat.id}`}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B4F5C] text-white border-[#0B4F5C] shadow-sm scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mb-1.5">{cat.icon}</div>
                    <span className="text-xs font-bold leading-tight">{cat.nameEn}</span>
                    <span
                      className={`text-[10px] leading-tight font-medium mt-0.5 ${
                        isSelected ? 'text-teal-100' : 'text-slate-500'
                      }`}
                    >
                      {cat.nameTa}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FLAT/LOCATION / இடம் */}
          <div>
            <label
              htmlFor="flat-location-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5"
            >
              FLAT/LOCATION <span className="text-slate-400 font-normal">/ இடம்</span>
            </label>
            <input
              id="flat-location-input"
              type="text"
              value={flatLocation}
              onChange={(e) => setFlatLocation(e.target.value)}
              placeholder="e.g. B-402, Block B"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#0B4F5C]/30 focus:border-[#0B4F5C]"
              required
            />
          </div>

          {/* DESCRIPTION / விளக்கம் */}
          <div>
            <label
              htmlFor="complaint-description-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5"
            >
              DESCRIPTION <span className="text-slate-400 font-normal">/ விளக்கம்</span>
            </label>
            <textarea
              id="complaint-description-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the issue..."
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4F5C]/30 focus:border-[#0B4F5C]"
              required
            ></textarea>
          </div>

          {/* PHOTO / புகைப்படம் (optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              PHOTO <span className="text-slate-400 font-normal">/ புகைப்படம் (optional)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={photoUrl}
                  alt="Uploaded issue"
                  className="w-full h-44 object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Photo attached
                </div>
              </div>
            ) : (
              <div
                id="photo-upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0B4F5C] rounded-2xl p-6 bg-slate-50/70 hover:bg-slate-100/80 flex flex-col items-center justify-center cursor-pointer transition"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6 text-slate-700 stroke-[1.75]" />
                </div>
                <span className="text-sm font-bold text-slate-700">Tap to upload</span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                  JPG, PNG or take photo
                </span>
              </div>
            )}

            {/* Quick Demo Photo Presets */}
            {!photoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sample photos:
                </span>
                <div className="flex gap-1.5 overflow-x-auto">
                  {demoPhotos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      className="text-[11px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600 hover:text-[#0B4F5C] hover:border-[#0B4F5C] flex items-center gap-1"
                    >
                      <ImageIcon className="w-3 h-3" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

          {/* SUBMIT BUTTON */}
          <button
            id="submit-complaint-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#08424D] hover:bg-[#06333c] active:scale-[0.99] disabled:opacity-50 text-white py-3.5 px-4 rounded-2xl shadow transition flex flex-col items-center justify-center gap-0.5 cursor-pointer mt-4"
          >
            <span className="text-base font-bold leading-tight">
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </span>
            <span className="text-xs text-teal-100/90 font-medium leading-tight">
              புகாரைச் சமர்ப்பிக்கவும்
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
