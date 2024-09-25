document.addEventListener('DOMContentLoaded', function() {

    const recommendedList = document.getElementById('recommended-list');
    const mealPlanList = document.getElementById('meal-plan-list');
    const totalAmountElement = document.getElementById('total-amount');
    let totalAmount = 0.00;

    function addToMealPlan(dishName, dishCost) {

      // Create list item for the meal plan
      const listItem = document.createElement('li');
      listItem.innerHTML = `${dishName} - $${dishCost.toFixed(2)}`;
  
      // Add remove and add more buttons
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function() {
        totalAmount -= dishCost;
        totalAmountElement.textContent = totalAmount.toFixed(2);
        listItem.remove();
      });
      listItem.appendChild(removeButton);
  
      // Update meal plan
      mealPlanList.appendChild(listItem);
      totalAmount += dishCost;
      totalAmountElement.textContent = totalAmount.toFixed(2);
    }

    const dishes = [
      { name: 'Tony\'s Pizza', cost: 9.99 },
      { name: 'Tony\'s Salad', cost: 7.49 },
      { name: 'Tony\'s Fresco', cost: 10.79 },
      { name: 'Old Town Chicken Sandwich', cost: 12.99 },
      { name: 'Old Town Reuben', cost: 12.99 },
      { name: 'Old Town Special', cost: 13.99 },
      { name: 'Cafe Pita Quesadilla', cost: 10.99 },
      { name: 'Cafe Salsaritas Bowl', cost: 10.99 },
      { name: 'Cafe Bojangles', cost: 9.99 },
    ];
  
    // Display recommended dishes
    dishes.forEach(dish => {
      const listItem = document.createElement('li');
      listItem.textContent = `${dish.name} - $${dish.cost.toFixed(2)}`;

      // Add click listener to add the dish to the meal plan
      listItem.addEventListener('click', function() {
        addToMealPlan(dish.name, dish.cost);
      });
      recommendedList.appendChild(listItem);
    });
  });