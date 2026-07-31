class DecorationModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String? image;
  final String category;
  final int totalQty;
  final int availableQty;
  final int? priceUnitHours;
  
  DecorationModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.image,
    required this.category,
    required this.totalQty,
    required this.availableQty,
    this.priceUnitHours,
  });
  
  factory DecorationModel.fromJson(Map<String, dynamic> json) {
    return DecorationModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      image: json['image'],
      category: json['category'] ?? 'General',
      totalQty: json['totalQty'] ?? 0,
      availableQty: json['availableQty'] ?? 0,
      priceUnitHours: json['priceUnitHours'],
    );
  }
}
