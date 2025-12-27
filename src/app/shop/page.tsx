'use client';
import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconPlus, IconTrash, IconEdit, IconPhoto, IconFileSpreadsheet } from '@tabler/icons-react';
import LottieLoader from '@/components/LottieLoader';
import AppLayout from '@/components/AppLayout';
import ArtCard from '@/components/ArtCard';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import './page.css';

interface Painting {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    status: 'available' | 'sold' | 'hidden';
}

export default function ShopPage() {
    const { user } = useAuth();
    const [paintings, setPaintings] = useState<Painting[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingPainting, setEditingPainting] = useState<Painting | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        if (user) {
            fetchPaintings();
        }
    }, [user]);

    const fetchPaintings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('paintings')
                .select('*')
                .eq('artist_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPaintings(data || []);
        } catch (error) {
            console.error('Error fetching paintings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setUploading(true);
            let imageUrl = editingPainting?.image_url || '';

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('artwork-images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('artwork-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }
            if (editingPainting) {
                const { error } = await supabase
                    .from('paintings')
                    .update({
                        title,
                        description,
                        price: parseFloat(price),
                        image_url: imageUrl
                    })
                    .eq('id', editingPainting.id);

                if (error) throw error;
            } else {
                const { data: newPainting, error } = await supabase
                    .from('paintings')
                    .insert([
                        {
                            artist_id: user.id,
                            title,
                            description,
                            price: parseFloat(price),
                            image_url: imageUrl,
                            status: 'available'
                        }
                    ])
                    .select()
                    .single();

                if (error) throw error;

                // Automatically create a feed post for the new painting
                if (newPainting) {
                    await supabase.from('posts').insert([{
                        user_id: user.id,
                        type: 'painting',
                        content: `Just listed a new artwork: ${title}`,
                        painting_id: newPainting.id
                    }]);
                }
            }

            setIsModalOpen(false);
            resetForm();
            fetchPaintings();
        } catch (error: any) {
            console.error('Error saving painting:', error);
            toast.error(`Error: ${error.message || 'Something went wrong'}.`);
        } finally {
            setUploading(false);
        }
    };

    const { confirm } = useModal();

    const handleEdit = (painting: Painting) => {
        setEditingPainting(painting);
        setTitle(painting.title);
        setDescription(painting.description);
        setPrice(painting.price.toString());
        setPreviewUrl(painting.image_url);
        setIsModalOpen(true);
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const allFiles = Array.from(e.target.files);
        const excelFile = allFiles.find(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'));
        const imageFiles = allFiles.filter(f => f.type.startsWith('image/'));

        if (!excelFile) {
            toast.error('Please select one Excel or CSV file along with your images.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                setLoading(true);
                const bstr = event.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet) as any[];

                const paintingsToInsert = [];
                const uploadPromises = [];

                for (const row of data) {
                    const title = row.Title || row.title || 'Untitled';
                    const description = row.Description || row.description || '';
                    const price = parseFloat(row.Price || row.price || '0');
                    const imageFilename = row['Image Filename'] || row.image_filename || row['Image File'] || row.image_file;

                    if (!title || isNaN(price)) continue;

                    // Try to find the image in the selected files
                    const matchedFile = imageFiles.find(f => f.name === imageFilename);
                    let imageUrl = '';

                    if (matchedFile) {
                        const fileExt = matchedFile.name.split('.').pop();
                        const fileName = `${Math.random()}.${fileExt}`;
                        const filePath = `${user.id}/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                            .from('artwork-images')
                            .upload(filePath, matchedFile);

                        if (!uploadError) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('artwork-images')
                                .getPublicUrl(filePath);
                            imageUrl = publicUrl;
                        } else {
                            console.warn(`Failed to upload ${matchedFile.name}:`, uploadError);
                        }
                    }

                    paintingsToInsert.push({
                        artist_id: user.id,
                        title,
                        description,
                        price,
                        image_url: imageUrl,
                        status: 'available'
                    });
                }

                if (paintingsToInsert.length === 0) {
                    toast.error('No valid artwork data found in the file. Please check the format.');
                    return;
                }

                const { data: newPaintings, error } = await supabase
                    .from('paintings')
                    .insert(paintingsToInsert)
                    .select();

                if (error) throw error;

                // Automatically create feed posts for bulk-uploaded paintings
                if (newPaintings && newPaintings.length > 0) {
                    const postInserts = newPaintings.map(p => ({
                        user_id: user.id,
                        type: 'painting',
                        content: `Just listed a new artwork: ${p.title}`,
                        painting_id: p.id
                    }));
                    await supabase.from('posts').insert(postInserts);
                }

                toast.success(`Successfully processed ${paintingsToInsert.length} artworks!`);
                fetchPaintings();
            } catch (err: any) {
                console.error('Bulk upload failed:', err);
                toast.error(`Bulk upload failed: ${err.message}`);
            } finally {
                setLoading(false);
                e.target.value = '';
            }
        };

        reader.readAsBinaryString(excelFile);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrice('');
        setImageFile(null);
        setPreviewUrl('');
        setEditingPainting(null);
    };

    const deletePainting = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Artwork',
            message: 'Are you sure you want to delete this artwork? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('paintings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Artwork deleted successfully!');
            fetchPaintings();
        } catch (error: any) {
            console.error('Error deleting painting:', error);
            toast.error(`Delete failed: ${error.message || 'Unknown error'}`);
        }
    };

    const deleteAllPaintings = async () => {
        const confirmed = await confirm({
            title: 'Delete All Artworks',
            message: 'Are you sure you want to DELETE ALL artworks? This cannot be undone.',
            confirmText: 'Delete All',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('paintings')
                .delete()
                .eq('artist_id', user?.id);

            if (error) throw error;
            fetchPaintings();
            toast.success('All artworks deleted successfully.');
        } catch (error: any) {
            console.error('Error deleting all paintings:', error);
            toast.error(`Error: ${error.message}`);
        }
    };

    return (
        <AppLayout>
            <div className="shop-container">
                <div className="shop-header">
                    <div>
                        <h1>My Art Store</h1>
                        <p>Manage your listed paintings and creations</p>
                    </div>
                    <div className="header-actions">
                        <label className="bulk-btn">
                            <IconFileSpreadsheet size={20} />
                            <span>Bulk Upload</span>
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv, image/*"
                                onChange={handleBulkUpload}
                                multiple
                                hidden
                            />
                        </label>
                        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                            <IconPlus size={20} />
                            <span>Add Artwork</span>
                        </button>
                        {paintings.length > 0 && (
                            <button className="delete-all-btn" onClick={deleteAllPaintings}>
                                <IconTrash size={20} />
                                <span>Delete All</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <div className="shop-table-container">
                        {paintings.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon-wrapper">
                                    <IconPhoto size={40} />
                                </div>
                                <h3>No artworks yet</h3>
                                <p>Start by adding your first creation to the store.</p>
                                <button className="add-btn-link" onClick={() => setIsModalOpen(true)}>
                                    Add Your First Artwork
                                </button>
                            </div>
                        ) : (
                            <table className="shop-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paintings.map((painting) => (
                                        <tr key={painting.id}>
                                            <td className="col-image">
                                                <div className="table-img-wrap">
                                                    <img src={painting.image_url || '/placeholder-art.png'} alt={painting.title} />
                                                </div>
                                            </td>
                                            <td className="col-name">{painting.title}</td>
                                            <td className="col-price">₹{painting.price.toLocaleString()}</td>
                                            <td className="col-desc">
                                                <div className="desc-text">{painting.description || '-'}</div>
                                            </td>
                                            <td className="col-status">
                                                <span className={`table-status ${painting.status}`}>
                                                    {painting.status}
                                                </span>
                                            </td>
                                            <td className="col-actions">
                                                <button className="table-action-btn edit" onClick={() => handleEdit(painting)} title="Edit">
                                                    <IconEdit size={18} />
                                                </button>
                                                <button className="table-action-btn delete" onClick={() => deletePainting(painting.id)} title="Delete">
                                                    <IconTrash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{editingPainting ? 'Edit Artwork' : 'Add New Artwork'}</h2>
                                <button className="close-modal" onClick={() => { setIsModalOpen(false); resetForm(); }}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Artwork Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Whispers of the Forest"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your artwork..."
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Artwork Image</label>
                                    <div className="image-upload-container">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            id="artwork-image"
                                            hidden
                                        />
                                        <label htmlFor="artwork-image" className="upload-label">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="upload-preview" />
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <IconPhoto size={32} />
                                                    <span>Click to upload image</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={uploading}>
                                        {uploading ? 'Processing...' : (editingPainting ? 'Update Artwork' : 'List in Shop')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
