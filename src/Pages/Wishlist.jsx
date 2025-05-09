import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, IconButton, Pagination, ToggleButtonGroup, ToggleButton, Button, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { addToCart } from "../Components/cart/cartUtils";

const StyledToggleButton = styled(ToggleButton)(() => ({
    border: '2px solid transparent',
    padding: 4,
    '&.Mui-selected': { borderColor: '#000' },
    '&:not(:last-of-type)': { marginRight: 4 },
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}));

const SaleBadge = styled(Box)(({ discount }) => ({
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '4px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1
}));

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [view, setView] = useState('module');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = "u1234567890";

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'favorites', userId, 'items'),
            (snapshot) => {
                setWishlist(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'favorites', userId, 'items', id));
            toast.success('Product removed from wishlist');
        } catch (err) {
            toast.error('Delete error');
        }
    };

    const AddToCart = async (item) => {
        try {
            await addToCart(userId, item);
            toast.success("✅ Added to cart!");
        } catch (err) {
            if (err.message === 'ALREADY_EXISTS') {
                toast.info("ℹ️ Product already in cart!");
            } else {
                toast.error("❌ Failed to add to cart");
            }
        }
    };

    const itemsPerPage = 3;
    const idxLast = page * itemsPerPage;
    const idxFirst = idxLast - itemsPerPage;
    const currentItems = view === 'list'
        ? wishlist.slice(idxFirst, idxLast)
        : wishlist;

    const renderCard = (item) => {
        const discount = item.discount ?? (Math.random() > 0.5 ? 70 : 50);
        const original = typeof item.price === 'object' ? item.price.amount : item.price;
        const finalPrice = discount
            ? (original * (1 - discount / 100)).toFixed(2)
            : original;

        const isListOrAgenda = view === 'list';

        return (
            <Card
                sx={{
                    position: 'relative',
                    mb: 3,
                    display: 'flex',
                    flexDirection: isListOrAgenda ? 'row' : 'column',
                    height: isListOrAgenda ? 300 : 'auto',
                }}
                key={item.id}
            >
                <IconButton
                    onClick={() => handleDelete(item.id)}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                >
                    <CloseIcon />
                </IconButton>
                <SaleBadge discount={discount}>Sale {discount}%</SaleBadge>

                {/* Image Section with gray background */}
                <Box
                    sx={{
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CardMedia
                        component="img"
                        image={item.image?.src}
                        alt={item.title}
                        sx={{
                            maxHeight: '100%',
                            objectFit: 'cover',
                            backgroundColor:'#f0f0f0',
                            borderRadius: 2,
                            padding: 1
                        }}
                    />
                </Box>

                {/* Details Section */}
                <CardContent sx={{ width: isListOrAgenda ? '50%' : '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.product?.title || item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.product?.type}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                        {discount && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                LE {original.toLocaleString()}
                            </Typography>
                        )}
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            LE {Number(finalPrice).toLocaleString()}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        sx={{ mt: 3, borderColor: '#000', color: '#000' , '&:hover': { backgroundColor: '#000', color: '#fff' },width: '60%' }}
                        onClick={() => AddToCart(item)}
                    >
                        QUICK ADD 🛒
                    </Button>
                </CardContent>
            </Card>
        );
    };


    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>WISHLIST</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Typography>VIEW AS</Typography>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={(e, v) => v && (setView(v), setPage(1))}
                >
                    <StyledToggleButton value="list"><ViewListIcon /></StyledToggleButton>
                    <StyledToggleButton value="agenda"><ViewAgendaIcon /></StyledToggleButton>
                    <StyledToggleButton value="module"><ViewModuleIcon /></StyledToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Button variant="outlined" onClick={() => navigate('/')} sx={{ mb: 3 }}>
                Back to Products
            </Button>

            {loading ? (
                <Typography align="center">Loading...</Typography>
            ) : wishlist.length === 0 ? (
                <Typography align="center" color="text.secondary">No products</Typography>
            ) : view === 'list' ? (
                <>
                    {currentItems.map(renderCard)}
                    {wishlist.length > itemsPerPage && (
                        <Pagination
                            count={Math.ceil(wishlist.length / itemsPerPage)}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
                        />
                    )}
                </>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: view === 'agenda' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                        gap: 3
                    }}
                >
                    {wishlist.map(renderCard)}
                </Box>
            )}

            {/* <ToastContainer position="top-center" /> */}
        </Box>
    );
};

export default Wishlist;
