import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../providers/cart_provider.dart';
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

  DateTime? _startDate;
  DateTime? _endDate;
  String _paymentMethod = "LOCAL_EVC";
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
    "LOCAL_EVC": "EVC Plus",
    "LOCAL_EDAHAB": "eDahab",
    "LOCAL_SAHAL": "Sahal",
    "LOCAL_PREMIER_WALLET": "Premier Wallet",
    "GLOBAL_MASTERCARD": "Mastercard",
    "GLOBAL_PAYPAL": "PayPal",
  };

  @override
  void dispose() {
    _locationController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  double get _durationHours {
    if (_startDate == null || _endDate == null) return 0;
    final diff = _endDate!.difference(_startDate!).inMinutes;
    if (diff <= 0) return 0;
    return diff / 60.0;
  }

  double _calculateDynamicTotalPrice(CartProvider cartProvider) {
    final hours = _durationHours;
    if (hours <= 0) {
      // Base price if no valid dates selected
      return cartProvider.totalPrice;
    }
    double total = 0;
    for (var item in cartProvider.items) {
      final priceUnit = item.decoration.priceUnitHours ?? 1;
      final blocks = (hours / priceUnit).ceil();
      total += item.decoration.price * blocks * item.quantity;
    }
    return total;
  }

  String _formatDateTime(DateTime? dt) {
    if (dt == null) return "Select date & time";
    final monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    final day = dt.day.toString().padLeft(2, '0');
    final month = monthNames[dt.month - 1];
    final year = dt.year;
    final hour = dt.hour.toString().padLeft(2, '0');
    final minute = dt.minute.toString().padLeft(2, '0');
    return "$day $month $year, $hour:$minute";
  }

  Future<DateTime?> _pickDateTime(BuildContext context, DateTime? initial) async {
    final date = await showDatePicker(
      context: context,
      initialDate: initial ?? DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              onSurface: AppTheme.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (date == null) return null;

    if (!context.mounted) return null;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initial ?? DateTime.now()),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              onSurface: AppTheme.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (time == null) return null;

    return DateTime(date.year, date.month, date.day, time.hour, time.minute);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cartProvider, child) {
        final totalPrice = _calculateDynamicTotalPrice(cartProvider);
        final depositRequired = (totalPrice * 0.20);
        
        // Auto fill deposit if empty
        if (_amountController.text.isEmpty && totalPrice > 0) {
          _amountController.text = depositRequired.toStringAsFixed(2);
        }

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
                      Text("Processing booking & payment...", style: TextStyle(color: AppTheme.textSecondary)),
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
                        _buildSectionHeader("1. Event Schedule", LucideIcons.calendar),
                        const SizedBox(height: 16),
                        _buildDateTimePickerRow(context),
                        const SizedBox(height: 24),
                        _buildSectionHeader("2. Venue Details", LucideIcons.mapPin),
                        const SizedBox(height: 16),
                        _buildLocationInput(),
                        const SizedBox(height: 24),
                        _buildSectionHeader("3. Payment Info", LucideIcons.dollarSign),
                        const SizedBox(height: 16),
                        _buildPaymentMethodDropdown(),
      const SizedBox(height: 16),
      _buildPayerPhoneInput(),
                        const SizedBox(height: 16),
                        _buildPaymentAmountInput(depositRequired, totalPrice),
                        const SizedBox(height: 32),
                        _buildBookingSummaryCard(totalPrice, depositRequired),
                        const SizedBox(height: 32),
                        CustomButton(
                          text: "Confirm & Pay \$${double.tryParse(_amountController.text)?.toStringAsFixed(2) ?? depositRequired.toStringAsFixed(2)}",
                          onPressed: () => _handleSubmit(cartProvider, depositRequired, totalPrice),
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

  Widget _buildDateTimePickerRow(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Event Start", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  final dt = await _pickDateTime(context, _startDate);
                  if (dt != null) {
                    setState(() {
                      _startDate = dt;
                    });
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.calendar, size: 16, color: AppTheme.textSecondary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _startDate != null ? _formatDateTime(_startDate) : "Start Time",
                          style: TextStyle(
                            fontSize: 12,
                            color: _startDate != null ? AppTheme.textPrimary : AppTheme.textSecondary,
                            fontWeight: _startDate != null ? FontWeight.bold : FontWeight.normal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Event End", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              InkWell(
                onTap: () async {
                  final dt = await _pickDateTime(context, _endDate);
                  if (dt != null) {
                    setState(() {
                      _endDate = dt;
                    });
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: AppTheme.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.calendar, size: 16, color: AppTheme.textSecondary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _endDate != null ? _formatDateTime(_endDate) : "End Time",
                          style: TextStyle(
                            fontSize: 12,
                            color: _endDate != null ? AppTheme.textPrimary : AppTheme.textSecondary,
                            fontWeight: _endDate != null ? FontWeight.bold : FontWeight.normal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLocationInput() {
    return DropdownButtonFormField<String>(
      value: _selectedLocation,
      items: _locations.map((loc) {
        return DropdownMenuItem<String>(
          value: loc,
          child: Text(
            loc,
            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
        );
      }).toList(),
      onChanged: (val) {
        setState(() {
          _selectedLocation = val;
          _locationController.text = val ?? "";
        });
      },
      validator: (value) {
        if (value == null || value.trim().isEmpty) return "Location is required";
        return null;
      },
      decoration: InputDecoration(
        labelText: "Venue Location",
        hintText: "Select location",
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
                      Icon(
                        entry.key.startsWith("GLOBAL") ? LucideIcons.globe : LucideIcons.smartphone,
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

  Widget _buildPaymentAmountInput(double minDeposit, double maxTotal) {
    return TextFormField(
      controller: _amountController,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      onChanged: (val) {
        setState(() {}); // refresh payment amount text in bottom button
      },
      validator: (value) {
        if (value == null || value.isEmpty) return "Payment amount is required";
        final amt = double.tryParse(value);
        if (amt == null) return "Enter a valid number";
        if (amt < minDeposit - 0.01) return "Minimum deposit required is \$${minDeposit.toStringAsFixed(2)}";
        if (amt > maxTotal + 0.01) return "Payment cannot exceed \$${maxTotal.toStringAsFixed(2)}";
        return null;
      },
      decoration: InputDecoration(
        labelText: "Payment Amount (\$)",
        hintText: minDeposit.toStringAsFixed(2),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.border),
        ),
        prefixIcon: const Icon(LucideIcons.wallet, color: AppTheme.textSecondary),
        helperText: "Pay any amount from the 20% deposit up to the total price.",
        helperStyle: const TextStyle(fontSize: 10),
        fillColor: Colors.white,
        filled: true,
      ),
    );
  }

  Widget _buildBookingSummaryCard(double totalPrice, double depositRequired) {
    final amtPaid = double.tryParse(_amountController.text) ?? depositRequired;
    final remainingBalance = (totalPrice - amtPaid).clamp(0.0, totalPrice);

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
          const Text("Booking Summary", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildSummaryCardRow("Rental Duration", _durationHours > 0 ? "${_durationHours.toStringAsFixed(1)} hrs" : "Select dates"),
          const Divider(color: Colors.white24),
          _buildSummaryCardRow("Subtotal Price", "\$${totalPrice.toStringAsFixed(2)}"),
          const Divider(color: Colors.white24),
          _buildSummaryCardRow("Amount You Pay Now", "\$${amtPaid.toStringAsFixed(2)}", isHighlight: true),
          const Divider(color: Colors.white24),
          _buildSummaryCardRow("Remaining Balance", "\$${remainingBalance.toStringAsFixed(2)}"),
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

  Future<void> _handleSubmit(CartProvider cartProvider, double minDeposit, double maxTotal) async {
    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select event start and end dates.")),
      );
      return;
    }

    if (_endDate!.isBefore(_startDate!) || _endDate!.isAtSameMomentAs(_startDate!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Event end date must be after event start date.")),
      );
      return;
    }

    if (_startDate!.isBefore(DateTime.now().subtract(const Duration(minutes: 5)))) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Event start date cannot be in the past.")),
      );
      return;
    }

    if (!_formKey.currentState!.validate()) return;

    if (_payerPhone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Payer phone number is required.")),
      );
      return;
    }

    final payAmt = double.tryParse(_amountController.text) ?? minDeposit;

    setState(() {
      _isSubmitting = true;
    });

    try {
      // First create booking in backend — returns the real bookingId
      final bookingId = await cartProvider.createBooking(
        eventDate: _startDate!,
        endDate: _endDate!,
        location: _locationController.text.trim(),
        paymentAmount: payAmt,
        paymentMethod: _paymentMethod,
      );

      // Then call WaafiPay purchase with the real bookingId.
      // The backend will record the payment ONLY after WaafiPay confirms.
      final apiService = ApiService();
      await apiService.purchaseWaafi(
        accountNo: _payerPhone,
        amount: payAmt,
        currency: "USD",
        referenceId: "mobile-${DateTime.now().millisecondsSinceEpoch}",
        bookingId: bookingId,
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
