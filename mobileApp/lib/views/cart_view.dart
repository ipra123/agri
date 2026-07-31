import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../models/cart_item_model.dart';
import 'auth/login_view.dart';
import 'checkout_view.dart';

/// Agri Marketplace Theme Colors
class AgriTheme {
  static const Color background = Color(0xFFF6F9F6);
  static const Color primary = Color(0xFF1E6F3D);
  static const Color primaryLight = Color(0xFFE8F5E9);
  static const Color accentAmber = Color(0xFFD97706);
  static const Color textDark = Color(0xFF191C19);
  static const Color textMuted = Color(0xFF52634F);
  static const Color cardBg = Colors.white;
  static const Color border = Color(0xFFE2E8E2);
}

class CartView extends StatelessWidget {
  const CartView({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cartProvider, child) {
        final cartItems = cartProvider.items;

        double subtotal = cartProvider.totalPrice;
        // Standard Delivery/Logistics Fee for Agricultural Inputs
        double deliveryFee = cartItems.isNotEmpty ? 2.50 : 0.0;
        double total = subtotal + deliveryFee;

        return Scaffold(
          backgroundColor: AgriTheme.background,
          appBar: AppBar(
            backgroundColor: AgriTheme.background,
            elevation: 0,
            scrolledUnderElevation: 0,
            centerTitle: true,
            title: const Text(
              "Agri Inputs Cart",
              style: TextStyle(
                color: AgriTheme.primary,
                fontWeight: FontWeight.w900,
                fontSize: 20,
              ),
            ),
          ),
          body: cartItems.isEmpty
              ? _buildEmptyCart(context)
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        itemCount: cartItems.length,
                        itemBuilder: (context, index) {
                          final item = cartItems[index];
                          return _buildCartItem(context, item, cartProvider);
                        },
                      ),
                    ),
                    _buildSummary(
                        context, subtotal, deliveryFee, total, cartProvider),
                  ],
                ),
        );
      },
    );
  }

  /// Empty Cart View tailored for Agricultural Inputs
  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: AgriTheme.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.shoppingBag,
                size: 70,
                color: AgriTheme.primary,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "Your Agri Cart is Empty",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AgriTheme.textDark,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Start exploring seeds, fertilizers, farm tools & irrigation equipment.",
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AgriTheme.textMuted,
                fontSize: 13.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Cart Item Card
  Widget _buildCartItem(
      BuildContext context, CartItem item, CartProvider cartProvider) {
    final double itemTotal = item.decoration.price * item.quantity;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AgriTheme.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AgriTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Product Image
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: item.decoration.image != null
                ? Image.network(
                    item.decoration.image!,
                    width: 85,
                    height: 85,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 85,
                      height: 85,
                      color: AgriTheme.primaryLight,
                      child: const Icon(LucideIcons.sprout,
                          color: AgriTheme.primary),
                    ),
                  )
                : Container(
                    width: 85,
                    height: 85,
                    color: AgriTheme.primaryLight,
                    child: const Icon(LucideIcons.sprout,
                        color: AgriTheme.primary),
                  ),
          ),
          const SizedBox(width: 14),

          // Product Details & Controls
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category or Supplier Tag
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.decoration.category ?? "Agri Input",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AgriTheme.textMuted,
                      ),
                    ),
                    IconButton(
                      constraints:
                          const BoxConstraints(minWidth: 28, minHeight: 28),
                      padding: EdgeInsets.zero,
                      onPressed: () {
                        cartProvider.removeItem(item.decoration.id);
                      },
                      icon: const Icon(LucideIcons.trash2,
                          color: Colors.redAccent, size: 18),
                    ),
                  ],
                ),
                Text(
                  item.decoration.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AgriTheme.textDark,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),

                // Unit Price & Dynamic Total
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "\$${item.decoration.price.toStringAsFixed(2)} / unit",
                      style: const TextStyle(
                        color: AgriTheme.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                    _buildQuantitySelector(item, cartProvider),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Modern Quantity Selector
  Widget _buildQuantitySelector(CartItem item, CartProvider cartProvider) {
    return Container(
      decoration: BoxDecoration(
        color: AgriTheme.primaryLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AgriTheme.primary.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: () {
              cartProvider.updateQuantity(
                  item.decoration.id, item.quantity - 1);
            },
            icon: const Icon(LucideIcons.minus,
                size: 14, color: AgriTheme.primary),
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            padding: EdgeInsets.zero,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Text(
              "${item.quantity}",
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 13,
                color: AgriTheme.primary,
              ),
            ),
          ),
          IconButton(
            onPressed: () {
              cartProvider.updateQuantity(
                  item.decoration.id, item.quantity + 1);
            },
            icon: const Icon(LucideIcons.plus,
                size: 14, color: AgriTheme.primary),
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  /// Summary & Checkout Sheet with EVC Plus Mobile Money Info
  Widget _buildSummary(BuildContext context, double subtotal,
      double deliveryFee, double total, CartProvider cartProvider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AgriTheme.cardBg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 15,
            offset: const Offset(0, -5),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            // EVC Plus / Mobile Money Payment Notice
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: AgriTheme.accentAmber.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: AgriTheme.accentAmber.withOpacity(0.3)),
              ),
              child: Row(
                children: const [
                  Icon(LucideIcons.smartphone,
                      size: 16, color: AgriTheme.accentAmber),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "Pay securely via EVC Plus & Mobile Money",
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: AgriTheme.accentAmber,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            _buildSummaryRow("Subtotal Inputs", "\$${subtotal.toStringAsFixed(2)}"),
            const SizedBox(height: 8),
            _buildSummaryRow(
                "Estimated Delivery Fee", "\$${deliveryFee.toStringAsFixed(2)}"),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Divider(color: AgriTheme.border),
            ),
            _buildSummaryRow(
                "Total Amount", "\$${total.toStringAsFixed(2)}",
                isTotal: true),
            const SizedBox(height: 18),

            CustomButton(
              text: "Proceed to Mobile Checkout",
              onPressed: () {
                final authProvider = context.read<AuthProvider>();
                if (!authProvider.isAuthenticated) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginView()),
                  );
                  return;
                }
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CheckoutView()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 13.5,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: isTotal ? AgriTheme.textDark : AgriTheme.textMuted,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 20 : 13.5,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.bold,
            color: isTotal ? AgriTheme.primary : AgriTheme.textDark,
          ),
        ),
      ],
    );
  }
}