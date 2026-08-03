import 'decoration_model.dart';

class BookingModel {
  final String id;
  final DateTime eventDate;
  final DateTime endDate;
  final String location;
  final String status;
  final double totalPrice;
  final double deposit;
  final double balance;
  final DateTime createdAt;
  final List<BookingItemModel> bookingItems;
  final List<PaymentModel> payments;
  final bool hasCancelRequest;

  BookingModel({
    required this.id,
    required this.eventDate,
    required this.endDate,
    required this.location,
    required this.status,
    required this.totalPrice,
    required this.deposit,
    required this.balance,
    required this.createdAt,
    required this.bookingItems,
    required this.payments,
    this.hasCancelRequest = false,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final double totalPriceValue = (json['totalAmount'] ?? json['totalPrice'] ?? 0).toDouble();

    List<BookingItemModel> itemsList = [];
    if (json['items'] != null) {
      itemsList = (json['items'] as List).map((i) => BookingItemModel.fromJson(i)).toList();
    } else if (json['bookingItems'] != null) {
      itemsList = (json['bookingItems'] as List).map((i) => BookingItemModel.fromJson(i)).toList();
    }

    List<PaymentModel> paymentsList = [];
    if (json['payments'] != null) {
      paymentsList = (json['payments'] as List).map((p) => PaymentModel.fromJson(p)).toList();
    }
    if (paymentsList.isEmpty && (json['paymentStatus'] == 'PAID' || json['status'] == 'CONFIRMED' || json['status'] == 'DELIVERED')) {
      paymentsList.add(PaymentModel(
        id: 'pay-${json['id']}',
        amount: totalPriceValue,
        method: json['paymentMethod'] ?? 'WAAFI',
        status: 'SUCCESS',
        transactionId: json['last4Digits'] ?? 'TXN-SUCCESS',
        createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      ));
    }

    return BookingModel(
      id: json['id'] ?? '',
      eventDate: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      endDate: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      location: json['shippingAddress'] ?? json['location'] ?? '',
      status: json['status'] ?? 'PENDING',
      totalPrice: totalPriceValue,
      deposit: totalPriceValue,
      balance: 0.0,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      bookingItems: itemsList,
      payments: paymentsList,
      hasCancelRequest: json['status'] == 'CANCELLED',
    );
  }
}

class BookingItemModel {
  final String id;
  final int quantity;
  final double price;
  final DecorationModel decoration;

  BookingItemModel({
    required this.id,
    required this.quantity,
    required this.price,
    required this.decoration,
  });

  factory BookingItemModel.fromJson(Map<String, dynamic> json) {
    return BookingItemModel(
      id: json['id'] ?? '',
      quantity: json['quantity'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
      decoration: DecorationModel.fromJson(json['product'] ?? json['decoration'] ?? {}),
    );
  }
}

class PaymentModel {
  final String id;
  final double amount;
  final String method;
  final String status;
  final String transactionId;
  final DateTime createdAt;

  PaymentModel({
    required this.id,
    required this.amount,
    required this.method,
    required this.status,
    required this.transactionId,
    required this.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      method: json['method'] ?? '',
      status: json['status'] ?? '',
      transactionId: json['transactionId'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}
