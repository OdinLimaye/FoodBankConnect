# test_foodbanks_card_clickable.py
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class FoodbanksCardClickableTest(unittest.TestCase):

    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 5)
        self.base_url = "https://foodbankconnect.me/foodbanks"

    def test_first_card_clickable(self):
        self.driver.get(self.base_url)
        # wait until at least one card is present
        card = self.wait.until(
            EC.element_to_be_clickable((By.CLASS_NAME, "card"))
        )
        initial_url = self.driver.current_url
        card.click()
        # wait for URL to change
        self.wait.until(lambda d: d.current_url != initial_url)
        self.assertNotEqual(self.driver.current_url, initial_url, "Clicking card did not navigate")
        print("✅ First Foodbank card is clickable and navigates.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
