import 'package:flutter/material.dart';
import '../models/cart_item_model.dart';
import '../models/decoration_model.dart';
import '../services/api_service.dart';

class CartProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final List<CartItem> _items = [];
  
  List<CartItem> get items => _items;

  double get totalPrice {
    double total = 0;
    for (var item in _items) {
      total += item.decoration.price * item.quantity;
    }
    return total;
  }

  void addItem(DecorationModel decoration) {
    for (var item in _items) {
      if (item.decoration.id == decoration.id) {
        item.quantity++;
        notifyListeners();
        return;
      }
    }
    _items.add(CartItem(decoration: decoration));
    notifyListeners();
  }

  void removeItem(String decorationId) {
    _items.removeWhere((item) => item.decoration.id == decorationId);
    notifyListeners();
  }

  void updateQuantity(String decorationId, int quantity) {
    for (var item in _items) {
      if (item.decoration.id == decorationId) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          _items.remove(item);
        }
        notifyListeners();
        return;
      }
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  Future<String> createBooking({
    required DateTime eventDate,
    required DateTime endDate,
    required String location,
    required double paymentAmount,
    required String paymentMethod,
  }) async {
    if (_items.isEmpty) throw Exception("Cart is empty");
    
    final itemsData = _items.map((item) => {
      'decorationId': item.decoration.id,
      'quantity': item.quantity,
    }).toList();

    final bookingData = {
      'eventDate': eventDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'location': location,
      'paymentAmount': paymentAmount,
      'paymentMethod': paymentMethod,
      'items': itemsData,
    };

    final response = await _apiService.createBooking(bookingData);
    clearCart();
    // Return the booking ID so the caller can pass it to WaafiPay
    return response['id'] as String;
  }
}
