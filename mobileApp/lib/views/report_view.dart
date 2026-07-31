import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/booking_model.dart';

class ReportView extends StatefulWidget {
  const ReportView({super.key});

  @override
  State<ReportView> createState() => _ReportViewState();
}

class _ReportViewState extends State<ReportView> {
  final ApiService _apiService = ApiService();
  List<BookingModel> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReportData();
  }

  Future<void> _loadReportData() async {
    try {
      final bookings = await _apiService.getUserBookings();
      setState(() {
        _bookings = bookings;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load transaction reports: $e')),
        );
      }
    }
  }

  String _formatDate(DateTime dt) {
    final monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return "${dt.day.toString().padLeft(2, '0')} ${monthNames[dt.month - 1]} ${dt.year}";
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.user;

    final List<Map<String, dynamic>> allPayments = [];
    double totalSpent = 0;
    double outstandingBalance = 0;

    for (var booking in _bookings) {
      if (booking.status.toUpperCase() != "CANCELLED") {
        outstandingBalance += booking.balance;
      }
      for (var payment in booking.payments) {
        if (payment.status.toUpperCase() == "SUCCESS") {
          totalSpent += payment.amount;
        }
        allPayments.add({
          'payment': payment,
          'bookingId': booking.id,
          'location': booking.location,
        });
      }
    }

    allPayments.sort((a, b) {
      final dateA = (a['payment'] as PaymentModel).createdAt;
      final dateB = (b['payment'] as PaymentModel).createdAt;
      return dateB.compareTo(dateA);
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text("Financial Statement"),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _loadReportData,
            icon: const Icon(LucideIcons.refreshCw, size: 20),
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              onRefresh: _loadReportData,
              color: AppTheme.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildUserHeaderCard(user),
                    const SizedBox(height: 24),
                    const Text(
                      "FINANCIAL SUMMARY",
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 12),
                    _buildFinancialGrid(totalSpent, outstandingBalance),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "TRANSACTIONS HISTORY",
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary, letterSpacing: 1.5),
                        ),
                        Text(
                          "${allPayments.length} Items",
                          style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (allPayments.isEmpty)
                      _buildEmptyTransactions()
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: allPayments.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = allPayments[index];
                          final payment = item['payment'] as PaymentModel;
                          final bookingId = item['bookingId'] as String;
                          final location = item['location'] as String;
                          return _buildTransactionCard(payment, bookingId, location);
                        },
                      ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildUserHeaderCard(dynamic user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.01), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppTheme.primary.withOpacity(0.1),
            child: Text(
              (user?.fullName ?? "U").substring(0, 1).toUpperCase(),
              style: const TextStyle(color: AppTheme.primary, fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName ?? "Account User",
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? "",
                  style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    user?.role ?? "CUSTOMER",
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primary, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialGrid(double totalSpent, double outstandingBalance) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.4,
      children: [
        _buildStatCard(
          "Total Spendings",
          "\$${totalSpent.toStringAsFixed(2)}",
          LucideIcons.creditCard,
          const Color(0xFF10B981),
        ),
        _buildStatCard(
          "Owed Balance",
          "\$${outstandingBalance.toStringAsFixed(2)}",
          LucideIcons.wallet,
          const Color(0xFFF59E0B),
        ),
        _buildStatCard(
          "Total Bookings",
          "${_bookings.length}",
          LucideIcons.calendar,
          AppTheme.primary,
        ),
        _buildStatCard(
          "Active Rentals",
          "${_bookings.where((b) => b.status.toUpperCase() == "CONFIRMED" || b.status.toUpperCase() == "TAKEN").length}",
          LucideIcons.clock,
          const Color(0xFF3B82F6),
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyTransactions() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      alignment: Alignment.center,
      child: Column(
        children: [
          Icon(LucideIcons.receipt, size: 48, color: AppTheme.textSecondary.withOpacity(0.3)),
          const SizedBox(height: 16),
          const Text("No Transactions", style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(height: 8),
          const Text(
            "Payments you make will appear here as transaction statements.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionCard(PaymentModel payment, String bookingId, String location) {
    final isSuccess = payment.status.toUpperCase() == "SUCCESS";
    final statusColor = isSuccess ? const Color(0xFF10B981) : Colors.redAccent;

    // Waxaa halkan lagu saxay habka jarista Booking ID-ga si ammaan ah
    final shortBookingId = bookingId.length > 6 
        ? bookingId.substring(bookingId.length - 6).toUpperCase() 
        : bookingId.toUpperCase();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (isSuccess ? const Color(0xFF10B981) : Colors.redAccent).withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isSuccess ? LucideIcons.checkCircle : LucideIcons.alertCircle,
              color: statusColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  payment.transactionId,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  "Booking: #$shortBookingId · $location",
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  "${payment.method.replaceAll('LOCAL_', '').replaceAll('GLOBAL_', '').replaceAll('_', ' ')} · ${_formatDate(payment.createdAt)}",
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                "\$${payment.amount.toStringAsFixed(2)}",
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  payment.status.toUpperCase(),
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 8, color: statusColor),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}