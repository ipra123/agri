import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import 'auth/login_view.dart';
import 'booking_success_view.dart';

class CheckoutView extends StatefulWidget {
  const CheckoutView({super.key});

  @override
  State<CheckoutView> createState() => _CheckoutViewState();
}

class _CheckoutViewState extends State<CheckoutView> {
  final _formKey = GlobalKey<FormState>();
  final _locationController = TextEditingController();
  final _amountController = TextEditingController();

  String _paymentMethod = "EVC Plus";
  String _payerPhone = "";
  bool _isSubmitting = false;
  String? _selectedLocation;

  final List<String> _locations = [
    "Hodan",
    "Wadajir",
    "Dharkiinleey",
    "Wabari",
    "Xamar Wayne",
    "Boondheer",
    "Kaaraan",
    "Kaxda",
    "Dayniile",
    "Garasbaaleey",
    "Cabdicasiis",
    "Gubadleey",
    "Shibi",
    "Yaaqshiid",
    "Hawlwadaag"
  ];

  final Map<String, String> _paymentMethods = {
    "EVC Plus": "EVC Plus",
    "eDahab": "eDahab",
    "Premier Wallet": "Premier Wallet",
  };

  @override
  void dispose() {
    _locationController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cartProvider, child) {
        final totalPrice = cartProvider.totalPrice;

        return Scaffold(
          appBar: AppBar(
            title: const Text("Checkout Details"),
            centerTitle: true,
          ),
          body: _isSubmitting
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: AppTheme.primary),
                      SizedBox(height: 16),
                      Text("Processing Order & Payment...", style: TextStyle(color: AppTheme.textSecondary)),
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
                        _buildSectionHeader("1. Delivery District", LucideIcons.mapPin),
                        const SizedBox(height: 16),
                        _buildLocationInput(),
                        const SizedBox(height: 24),
                        _buildSectionHeader("2. Payment Info", LucideIcons.dollarSign),
                        const SizedBox(height: 16),
                        _buildPaymentMethodDropdown(),
                        const SizedBox(height: 16),
                        _buildPayerPhoneInput(),
                        const SizedBox(height: 32),
                        _buildBookingSummaryCard(totalPrice, totalPrice),
                        const SizedBox(height: 32),
                        CustomButton(
                          text: "Confirm & Pay \$${totalPrice.toStringAsFixed(2)}",
                          onPressed: () => _handleSubmit(cartProvider, totalPrice),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
        );
      },
    );
  }

  Widget _buildPayerPhoneInput() {
    return TextFormField(
      keyboardType: TextInputType.phone,
      decoration: InputDecoration(
        labelText: "Payer Mobile Number",
        hintText: "e.g., 252611111111",
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        prefixIcon: const Icon(LucideIcons.phone, color: AppTheme.textSecondary),
        filled: true,
        fillColor: Colors.white,
      ),
      validator: (value) => (value == null || value.isEmpty) ? "Phone number required" : null,
      onChanged: (val) => setState(() => _payerPhone = val.trim()),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primary, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
        ),
      ],
    );
  }

  Widget _buildLocationInput() {
    return TextFormField(
      controller: _locationController,
      decoration: InputDecoration(
        labelText: "Delivery Address / Location",
        hintText: "e.g., Hodan, KM4, Mogadishu",
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        prefixIcon: const Icon(LucideIcons.mapPin, color: AppTheme.textSecondary),
        fillColor: Colors.white,
        filled: true,
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) return "Delivery location is required";
        return null;
      },
    );
  }

  Widget _buildPaymentMethodDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Payment Method", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: AppTheme.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _paymentMethod,
              isExpanded: true,
              icon: const Icon(LucideIcons.chevronDown, color: AppTheme.textSecondary),
              items: _paymentMethods.entries.map((entry) {
                return DropdownMenuItem<String>(
                  value: entry.key,
                  child: Row(
                    children: [
                      const Icon(
                        LucideIcons.smartphone,
                        color: AppTheme.primary,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        entry.value,
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    _paymentMethod = val;
                  });
                }
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBookingSummaryCard(double totalPrice, double depositRequired) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.15),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Order Summary", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildSummaryCardRow("Total Price", "\$${totalPrice.toStringAsFixed(2)}", isHighlight: true),
          const Divider(color: Colors.white24),
          _buildSummaryCardRow("Payment Status", "100% Paid on Confirmation"),
        ],
      ),
    );
  }

  Widget _buildSummaryCardRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
        Text(
          value,
          style: TextStyle(
            color: isHighlight ? const Color(0xFF6EE7B7) : Colors.white,
            fontSize: isHighlight ? 18 : 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Future<void> _handleSubmit(CartProvider cartProvider, double maxTotal) async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please log in first to complete your order & payment."),
          backgroundColor: Colors.red,
        ),
      );
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginView()),
      );
      return;
    }

    if (_payerPhone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Payer phone number is required.")),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      await cartProvider.createBooking(
        shippingAddress: _locationController.text.trim(),
        paymentMethod: _paymentMethod,
        payerPhone: _payerPhone,
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const BookingSuccessView()),
        );
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll("Exception: ", ""))),
      );
    }
  }

}
