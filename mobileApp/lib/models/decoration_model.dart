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
    String? imageUrl;
    if (json['images'] != null && json['images'] is List && (json['images'] as List).isNotEmpty) {
      imageUrl = json['images'][0];
    } else if (json['image'] != null) {
      imageUrl = json['image'];
    }

    String category = json['category'] ?? 'General';
    final upperCat = category.toString().toUpperCase();
    if (upperCat == 'SEEDS') {
      category = 'Seeds';
    } else if (upperCat == 'FERTILIZERS') {
      category = 'Fertilizers';
    } else if (upperCat == 'PESTICIDES') {
      category = 'Pesticides';
    } else if (upperCat == 'FARM_TOOLS') {
      category = 'Farm Tools';
    } else if (upperCat == 'IRRIGATION_EQUIPMENT' || upperCat == 'IRRIGATION') {
      category = 'Irrigation';
    } else if (upperCat == 'ANIMAL_FEED') {
      category = 'Animal Feed';
    } else if (upperCat == 'OTHER') {
      category = 'General';
    }

    return DecorationModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      image: imageUrl,
      category: category,
      totalQty: json['stock'] ?? json['stockQuantity'] ?? 0,
      availableQty: json['stockQuantity'] ?? json['stock'] ?? 0,
      priceUnitHours: json['priceUnitHours'],
    );
  }
}
