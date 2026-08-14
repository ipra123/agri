import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../providers/auth_provider.dart';
import 'auth/login_view.dart';

class SupplierDetailView extends StatefulWidget {
  final String supplierId;
  const SupplierDetailView({super.key, required this.supplierId});

  @override
  State<SupplierDetailView> createState() => _SupplierDetailViewState();
}

class _SupplierDetailViewState extends State<SupplierDetailView> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _supplier;
  bool _isLoading = true;

  final _commentController = TextEditingController();
  int _selectedRating = 5;
  bool _isSubmittingReview = false;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  Future<void> _fetchDetail() async {
    try {
      final supplier = await _apiService.getSupplierById(widget.supplierId);
      setState(() {
        _supplier = supplier;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitReview() async {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please log in first to leave a supplier review.'),
          backgroundColor: Colors.red,
        ),
      );
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginView()),
      );
      return;
    }

    if (_commentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please write a review comment')));
      return;
    }

    setState(() => _isSubmittingReview = true);
    try {
      final res = await _apiService.createReview(
        supplierId: widget.supplierId,
        rating: _selectedRating,
        comment: _commentController.text.trim(),
        targetType: 'SUPPLIER',
      );
      _commentController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.amber.shade900,
            content: Text(res['message'] ?? 'Review submitted! Pending admin approval.'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmittingReview = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Supplier Profile')),
        body: const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }

    if (_supplier == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Supplier Profile')),
        body: const Center(child: Text('Supplier details not available')),
      );
    }

    final displayName = _supplier!['supplierBusinessName'] ?? _supplier!['businessName'] ?? _supplier!['name'] ?? 'Supplier';
    final avgRating = _supplier!['avgRating'] ?? 0.0;
    final reviewCount = _supplier!['reviewCount'] ?? 0;
    final reviews = (_supplier!['supplierReviews'] as List?) ?? [];
    final products = (_supplier!['supplierProducts'] as List?) ?? [];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(displayName, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(20)),
                    child: const Center(child: Icon(LucideIcons.briefcase, color: Colors.white, size: 32)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(displayName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textPrimary)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(LucideIcons.star, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(avgRating > 0 ? '$avgRating' : 'New', style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(' ($reviewCount reviews)', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Products section
            Text('Products (${products.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            products.isEmpty
                ? const Text('No products listed yet.', style: TextStyle(color: AppTheme.textSecondary))
                : SizedBox(
                    height: 120,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: products.length,
                      itemBuilder: (context, idx) {
                        final prod = products[idx];
                        return Container(
                          width: 130,
                          margin: const EdgeInsets.only(right: 12),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.border)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(prod['name'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              const Spacer(),
                              Text('\$${prod['price']}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
            const SizedBox(height: 24),

            // Reviews & Ratings Form
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppTheme.border)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Rate & Review Supplier', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: List.generate(5, (index) {
                      final star = index + 1;
                      return IconButton(
                        onPressed: () => setState(() => _selectedRating = star),
                        icon: Icon(
                          LucideIcons.star,
                          color: star <= _selectedRating ? Colors.amber : Colors.grey.shade300,
                        ),
                      );
                    }),
                  ),
                  TextField(
                    controller: _commentController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Share your feedback...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _isSubmittingReview
                      ? const Center(child: CircularProgressIndicator())
                      : CustomButton(text: 'Submit Review', onPressed: _submitReview),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Customer Reviews List
            Text('Approved Reviews (${reviews.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            reviews.isEmpty
                ? const Text('No approved reviews for this supplier yet.', style: TextStyle(color: AppTheme.textSecondary))
                : Column(
                    children: reviews.map<Widget>((rev) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.border)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(rev['user']?['name'] ?? 'Customer', style: const TextStyle(fontWeight: FontWeight.bold)),
                                Row(
                                  children: [
                                    const Icon(LucideIcons.star, color: Colors.amber, size: 14),
                                    const SizedBox(width: 4),
                                    Text('${rev['rating']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(rev['comment'] ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
          ],
        ),
      ),
    );
  }
}
