import { Test } from "@nestjs/testing";
import { SubscriptionService } from "../../src/modules/subscription/subscription.js";
import { subscriptionMock } from "./mock-data/mock-data.js";
import { SubscriptionRepository } from "../../src/modules/subscription/subscription.repository.js";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Frequency } from "../../src/modules/subscription/enums/enums.js";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { WeatherService } from "../../src/modules/weather/weather.service.js";

describe("SubscriptionService", () => {
  let subscriptionService: SubscriptionService;

  const mockSubscriptionRepository = {
    find: jest.fn(),
    create: jest.fn(),
    confirm: jest.fn(),
    delete: jest.fn(),
  };

  const mockWeatherService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: mockSubscriptionRepository,
        },
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    subscriptionService = moduleRef.get(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("subscribe", () => {
    test("should create subscription, send email, and return token", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(
        subscriptionMock.responsefromRepository.emailNotExist
      );

      jest
        .spyOn(subscriptionService as any, "sendConfirmationEmail")
        .mockImplementation(async () => {});

      const result = await subscriptionService.subscribe(
        subscriptionMock.request.emailNotExist
      );

      expect(subscriptionService["sendConfirmationEmail"]).toHaveBeenCalledWith(
        subscriptionMock.responsefromRepository.emailNotExist
      );

      expect(result).toEqual(subscriptionMock.response.emailNotExist);
    });

    test("should send email again, and return token", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responsefromRepository.emailExist
      );

      jest
        .spyOn(subscriptionService as any, "sendConfirmationEmail")
        .mockImplementation(async () => {});

      const result = await subscriptionService.subscribe(
        subscriptionMock.request.emailExist
      );

      expect(subscriptionService["sendConfirmationEmail"]).toHaveBeenCalledWith(
        subscriptionMock.responsefromRepository.emailExist
      );

      expect(result).toEqual(subscriptionMock.response.emailExist);
    });

    test("should throw ConflictException if email is already confirmed", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responsefromRepository.emailExistAndConfirmed
      );

      await expect(
        subscriptionService.subscribe(
          subscriptionMock.request.emailExistAndConfirmed
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("confirm", () => {
    test("should confirm subscription and return void", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responsefromRepository.emailExist
      );

      await subscriptionService.confirm(
        subscriptionMock.responsefromRepository.emailExist.token
      );

      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        token: subscriptionMock.responsefromRepository.emailExist.token,
      });
    });

    test("should throw NotFoundException if token not found", async () => {
      mockSubscriptionRepository.find.mockRejectedValue(
        new NotFoundException("Token not found")
      );

      await expect(
        subscriptionService.confirm(
          subscriptionMock.responsefromRepository.emailNotExist.token
        )
      ).rejects.toThrow(NotFoundException);
    });

    test("should throw ConflictException if email is already confirmed", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responsefromRepository.emailExistAndConfirmed
      );

      await expect(
        subscriptionService.confirm(
          subscriptionMock.responsefromRepository.emailExistAndConfirmed.token
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("unsubscribe", () => {
    test("should unsubscribe and return void", async () => {
      mockSubscriptionRepository.find.mockResolvedValue(
        subscriptionMock.responsefromRepository.emailExist
      );

      await subscriptionService.unsubscribe(
        subscriptionMock.responsefromRepository.emailExist.token
      );

      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        token: subscriptionMock.responsefromRepository.emailExist.token,
      });
    });

    test("should throw NotFoundException if token not found", async () => {
      mockSubscriptionRepository.find.mockRejectedValue(
        new NotFoundException("Token not found")
      );

      await expect(
        subscriptionService.unsubscribe(
          subscriptionMock.responsefromRepository.emailNotExist.token
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("sendHourlyEmails", () => {
    test("should call sendFrequencyEmails with Frequency.Hourly", async () => {
      const frequencyEmails = jest
        .spyOn(subscriptionService as any, "sendFrequencyEmails")
        .mockImplementation(async () => {});

      await subscriptionService.sendHourlyEmails();

      expect(frequencyEmails).toHaveBeenCalledWith(Frequency.HOURLY);
    });
  });

  describe("sendDailyEmails", () => {
    test("should call sendFrequencyEmails with Frequency.Daily", async () => {
      const spy = jest
        .spyOn(subscriptionService as any, "sendFrequencyEmails")
        .mockImplementation(async () => {});

      await subscriptionService.sendDailyEmails();

      expect(spy).toHaveBeenCalledWith(Frequency.DAILY);
    });
  });
});
