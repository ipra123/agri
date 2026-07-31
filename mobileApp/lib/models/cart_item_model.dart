import 'decoration_model.dart';

class CartItem {
  final DecorationModel decoration;
  int quantity;
  
  CartItem({required this.decoration, this.quantity = 1});
}
