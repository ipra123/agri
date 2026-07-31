import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../services/api_service.dart';
import '../models/booking_model.dart';

class BookingPaymentView extends StatefulWidget {
  final BookingModel booking;
  const BookingPaymentView({super.key, required this.booking});

  @override
  State<BookingPaymentView> createState() => _BookingPaymentViewState();
}

class _BookingPaymentViewState extends State<BookingPaymentView> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String _paymentMethod = "LOCAL_EVC";
  bool _isSubmitting = false;

  final Map<String, String> _paymentMethods = {
    "LOCAL_EVC": "EVC Plus",
    "LOCAL_EDAHAB": "eDahab",
    "LOCAL_SAHAL": "Sahal",
    "LOCAL_PREMIER_WALLET": "Premier Wallet",
    "GLOBAL_MASTERCARD": "Mastercard",
    "GLOBAL_PAYPAL": "PayPal",
  };

  @override
  void initState() {
    super.initState();
    _amountController.text = widget.booking.balance.toStringAsFixed(2);
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final paidSoFar = widget.booking.totalPrice - widget.booking.balance;
    final currentInputAmount = double.tryParse(_amountController.text) ?? 0.0;
    final remainingBalanceAfterPayment = (widget.booking.balance - currentInputAmount).clamp(0.0, widget.booking.balance);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Make Payment"),
        centerTitle: true,
      ),
      body: _isSubmitting
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppTheme.primary),
                  SizedBox(height: 16),
                  Text("Processing transaction...", style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildBalanceSummaryCard(paidSoFar, remainingBalanceAfterPayment),
                    const SizedBox(height: 24),
                    const Text(
                      "Payment Amount (\$)",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    _buildAmountInputField(),
                    const SizedBox(height: 24),
                    const Text(
                      "Choose Payment Method",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(height: 12),
                    _buildPaymentMethodsList(),
                    const SizedBox(height: 32),
                    CustomButton(
                      text: "Submit Payment (\$${currentInputAmount.toStringAsFixed(2)})",
                      onPressed: _handlePaymentSubmit,
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildBalanceSummaryCard(double paidSoFar, double remainingAfter) {
    final themeColor = _paymentMethod.startsWith("GLOBAL") ? Colors.blue[700]! : AppTheme.primary;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: themeColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: themeColor.withOpacity(0.15),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Balance Summary",
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          _buildSummaryRow("Total Booking Price", "\$${widget.booking.totalPrice.toStringAsFixed(2)}"),
          const Divider(color: Colors.white24),
          _buildSummaryRow("Paid So Far", "\$${paidSoFar.toStringAsFixed(2)}"),
          const Divider(color: Colors.white24),
          _buildSummaryRow("Remaining Balance", "\$${widget.booking.balance.toStringAsFixed(2)}"),
          const Divider(color: Colors.white24),
          _buildSummaryRow("Balance After This Payment", "\$${remainingAfter.toStringAsFixed(2)}", isHighlight: true),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
        Text(
          value,
          style: TextStyle(
            color: isHighlight ? const Color(0xFF6EE7B7) : Colors.white,
            fontSize: isHighlight ? 16 : 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildAmountInputField() {
    return TextFormField(
      controller: _amountController,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      onChanged: (val) {
        setState(() {}); // trigger UI rebuild to show updated balance
      },
      validator: (value) {
        if (value == null || value.trim().isEmpty) return "Please enter an amount";
        final amt = double.tryParse(value);
        if (amt == null || amt <= 0) return "Please enter a valid amount greater than \$0";
        if (amt > widget.booking.balance + 0.01) return "Amount cannot exceed outstanding balance \$${widget.booking.balance.toStringAsFixed(2)}";
        return null;
      },
      decoration: InputDecoration(
        hintText: "Enter amount",
        prefixIcon: const Icon(LucideIcons.dollarSign, color: AppTheme.textSecondary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        filled: true,
        fillColor: Colors.white,
        helperText: "Maximum payment: \$${widget.booking.balance.toStringAsFixed(2)}",
        helperStyle: const TextStyle(fontSize: 10),
      ),
    );
  }

  Widget _buildPaymentMethodsList() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 2.2,
      ),
      itemCount: _paymentMethods.length,
      itemBuilder: (context, index) {
        final entry = _paymentMethods.entries.elementAt(index);
        final isSelected = _paymentMethod == entry.key;
        final isGlobal = entry.key.startsWith("GLOBAL");
        final themeColor = isGlobal ? Colors.blue[600]! : AppTheme.primary;

        return InkWell(
          onTap: () {
            setState(() {
              _paymentMethod = entry.key;
            });
          },
          borderRadius: BorderRadius.circular(16),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected
                  ? themeColor.withOpacity(0.08)
                  : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? themeColor : AppTheme.border,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isSelected ? themeColor.withOpacity(0.15) : AppTheme.background,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isGlobal ? LucideIcons.globe : LucideIcons.smartphone,
                    color: isSelected ? themeColor : AppTheme.textSecondary,
                    size: 16,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    entry.value,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: isSelected ? themeColor : AppTheme.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _handlePaymentSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final payAmt = double.parse(_amountController.text);

    setState(() {
      _isSubmitting = true;
    });

    try {
      await _apiService.payBookingBalance(widget.booking.id, payAmt, _paymentMethod);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment processed successfully!')),
        );
        Navigator.pop(context, true); // pop back to MyBookingsView and request refresh
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll("Exception: ", ""))),
        );
      }
    }
  }
}
